"use client";

import { useInkWise } from '../../lib/store/InkWiseContext';
import { InkWiseSettings } from '../../lib/image-processing/types';
import { Settings, Sliders } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function CleaningPanel() {
  const { settings, updateSettings, printSettings, updatePrintSettings, resetSettings } = useInkWise();
  const presets: Array<{ id: InkWiseSettings['preset']; label: string; desc: string }> = [
    { id: "Standard", label: "Standard", desc: "For most notes" },
    { id: "Light", label: "Light", desc: "Preserve details" },
    { id: "Strong", label: "Strong", desc: "Gray backgrounds" },
    { id: "Custom", label: "Custom", desc: "Manual control" },
  ];

  const handlePreset = (preset: "Standard" | "Light" | "Strong") => {
    if (preset === "Standard") updateSettings({ preset, whitePoint: 245, blackPoint: 0, gamma: 1 });
    if (preset === "Light") updateSettings({ preset, whitePoint: 250, blackPoint: 0, gamma: 1 });
    if (preset === "Strong") updateSettings({ preset, whitePoint: 235, blackPoint: 0, gamma: 1 });
  };

  const handleCustom = (updates: Partial<typeof settings>) => {
    updateSettings({ preset: "Custom", ...updates });
  };

  return (
    <div className="flex flex-col bg-white overflow-visible w-full shrink-0">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
        <h3 className="font-semibold text-gray-800 flex items-center">
          <Settings className="w-4 h-4 mr-2 text-emerald-600" /> Settings
        </h3>
        <button 
          onClick={resetSettings}
          className="text-xs text-gray-500 hover:text-gray-900 font-medium"
        >
          Reset
        </button>
      </div>
      
      <div className="p-5 space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Cleaning Mode</h4>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => p.id !== "Custom" ? handlePreset(p.id) : updateSettings({ preset: "Custom" })}
                className={twMerge(
                  clsx(
                    "flex flex-col items-start p-2 rounded border text-left transition-colors",
                    settings.preset === p.id 
                      ? "bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500" 
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  )
                )}
              >
                <span className="text-sm font-medium">{p.label}</span>
                <span className="text-[10px] text-gray-500 mt-0.5">{p.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {settings.preset === "Custom" && (
          <div className="space-y-4 pt-2 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <h4 className="text-sm font-medium text-gray-900 flex items-center mb-4">
              <Sliders className="w-3.5 h-3.5 mr-1.5 text-gray-400"/> Custom Levels
            </h4>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <label className="font-medium text-gray-700">White Point</label>
                <span className="text-gray-500">{settings.whitePoint}</span>
              </div>
              <input 
                type="range" min="150" max="255" value={settings.whitePoint}
                onChange={(e) => handleCustom({ whitePoint: Number(e.target.value) })}
                className="w-full accent-emerald-600"
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <label className="font-medium text-gray-700">Black Point</label>
                <span className="text-gray-500">{settings.blackPoint}</span>
              </div>
              <input 
                type="range" min="0" max="100" value={settings.blackPoint}
                onChange={(e) => handleCustom({ blackPoint: Number(e.target.value) })}
                className="w-full accent-gray-800"
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <label className="font-medium text-gray-700">Gamma</label>
                <span className="text-gray-500">{settings.gamma.toFixed(2)}</span>
              </div>
              <input 
                type="range" min="0.5" max="2.0" step="0.05" value={settings.gamma}
                onChange={(e) => handleCustom({ gamma: Number(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Print Optimization</h4>
          
          <label className="flex items-center space-x-3 mb-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={printSettings.grayscale}
              onChange={(e) => updatePrintSettings({ grayscale: e.target.checked })}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">Convert to Grayscale</span>
          </label>
          
          <label className="flex items-center space-x-3 mb-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={printSettings.increaseTextContrast}
              onChange={(e) => updatePrintSettings({ increaseTextContrast: e.target.checked })}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">Increase Text Contrast</span>
          </label>
          
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={printSettings.flattenTransparency}
              onChange={(e) => updatePrintSettings({ flattenTransparency: e.target.checked })}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">Flatten Transparency</span>
          </label>
        </div>
      </div>
    </div>
  );
}
