"use client";

import React, { useCallback, useRef } from 'react';
import { useInkWise } from '../../lib/store/InkWiseContext';
import { Trash2, FileImage, Plus, GripVertical } from 'lucide-react';
import Image from 'next/image';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Sortable Item Component ---
function SortableImageCard({ img, removeImage }: { img: any; removeImage: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: img.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes} 
      {...listeners}
      className={`group relative bg-white rounded-xl shadow-sm border border-slate-200 transition-all overflow-hidden flex flex-col cursor-grab active:cursor-grabbing ${
        isDragging ? 'shadow-2xl scale-[1.05] border-blue-400 rotate-2' : 'hover:shadow-md hover:border-slate-300'
      }`}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-[3/4] w-full bg-slate-50/50 flex items-center justify-center p-4">
        {img.thumbnailUrl ? (
          <div className="relative w-full h-full shadow-[0_2px_12px_rgba(0,0,0,0.06)] bg-white rounded-sm overflow-hidden pointer-events-none">
            <Image 
              src={img.thumbnailUrl} 
              alt={img.file.name} 
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <FileImage className="w-12 h-12 text-slate-300 pointer-events-none" />
        )}
        
        {/* Overlay Delete Button */}
        <button
          onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute top-2 right-2 bg-white/90 backdrop-blur text-slate-500 hover:text-red-500 hover:bg-white p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-20 border border-slate-100"
          title="Remove image"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* File Info */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <div className="flex items-center space-x-2">
          {/* Rank/Index badge for context */}
          <p className="text-[13px] font-medium text-slate-700 truncate" title={img.file.name}>
            {img.file.name}
          </p>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-[11px] text-slate-500">
            {(img.file.size / (1024 * 1024)).toFixed(2)} MB
          </p>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            img.status === 'Ready' ? 'bg-slate-100 text-slate-600' :
            img.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
            img.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
            'bg-red-100 text-red-700'
          }`}>
            {img.status}
          </span>
        </div>
      </div>
    </div>
  );
}

// --- Main Grid Component ---
export default function DocumentGrid() {
  const { images, removeImage, reorderImages, addImages } = useInkWise();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = images.findIndex((i) => i.id === active.id);
      const newIndex = images.findIndex((i) => i.id === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderImages(oldIndex, newIndex);
      }
    }
  }, [images, reorderImages]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const files = Array.from(e.target.files);
        addImages(files);
      }
      // Reset input so the same files can be picked again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [addImages]
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-6 pt-16 md:p-10 md:pt-20 relative">
      <div className="max-w-[1400px] mx-auto pb-24">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={images.map(img => img.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {images.map((img, index) => (
                <div key={img.id} className="relative">
                  <div className="absolute -top-3 -left-3 w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center text-[11px] font-bold z-30 shadow-md">
                    {index + 1}
                  </div>
                  <SortableImageCard img={img} removeImage={removeImage} />
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      
      {/* Floating Add Button */}
      <input 
        type="file" 
        multiple 
        accept="image/png, image/jpeg, image/webp" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        className="hidden" 
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="fixed bottom-8 right-8 md:right-[390px] w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40 group hover:scale-105 active:scale-95"
        title="Add more images"
      >
        <Plus className="w-7 h-7" />
        
        {/* Tooltip / Badge */}
        <span className="absolute -top-3 -left-3 bg-slate-900 text-white text-[11px] font-bold px-2 py-1 rounded-full shadow-sm scale-0 group-hover:scale-100 transition-transform origin-bottom-right">
          Add
        </span>
      </button>
    </div>
  );
}
