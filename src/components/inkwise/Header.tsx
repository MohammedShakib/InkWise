import { Lock } from 'lucide-react';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="h-14 md:h-[60px] flex items-center justify-between px-4 md:px-6 border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="flex items-center space-x-2">
        <Image src="/icon.png" alt="InkWise Icon" width={24} height={24} className="object-contain" />
        <Image src="/logo.png" alt="InkWise" width={96} height={32} className="object-contain" />
      </div>

      <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 shadow-sm">
        <Lock className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
        <span className="hidden text-[11px] font-medium text-slate-600 sm:inline">
          Processed locally. Nothing is uploaded.
        </span>
        <span className="text-[11px] font-medium text-slate-600 sm:hidden">Local only</span>
      </div>
    </header>
  );
}
