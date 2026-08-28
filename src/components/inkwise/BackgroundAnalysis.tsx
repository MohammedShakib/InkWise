"use client";

import { useInkWise } from '../../lib/store/InkWiseContext';
import { BarChart3 } from 'lucide-react';

export default function BackgroundAnalysis() {
  const { images, selectedImageId } = useInkWise();
  const selectedImage = images.find(img => img.id === selectedImageId);

  if (!selectedImage) return null;

  const before = selectedImage.analysisBefore;
  const after = selectedImage.analysisAfter;
  
  if (!before && !after) return null;

  return (
    <div className="p-5 border-t border-gray-100 bg-white">
      <h4 className="text-sm font-medium text-gray-900 flex items-center mb-4">
        <BarChart3 className="w-4 h-4 mr-1.5 text-blue-600" /> Background Analysis
      </h4>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-xs text-gray-500 block mb-1">Before</span>
          {before ? (
            <div className="space-y-1 text-gray-800">
              <div className="flex justify-between"><span>Pure White:</span> <span className="font-medium">{before.pureWhitePercentage.toFixed(1)}%</span></div>
              <div className="flex justify-between"><span>Near White:</span> <span className="font-medium">{before.nearWhitePercentage.toFixed(1)}%</span></div>
            </div>
          ) : (
            <span className="text-gray-400 text-xs italic">Processing...</span>
          )}
        </div>
        
        <div>
          <span className="text-xs text-gray-500 block mb-1">After</span>
          {after ? (
            <div className="space-y-1 text-emerald-700">
              <div className="flex justify-between"><span>Pure White:</span> <span className="font-medium">{after.pureWhitePercentage.toFixed(1)}%</span></div>
            </div>
          ) : (
            <span className="text-gray-400 text-xs italic">Processing...</span>
          )}
        </div>
      </div>
    </div>
  );
}
