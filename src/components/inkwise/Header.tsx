import { Lock } from 'lucide-react';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="h-16 md:h-[72px] flex items-center justify-between px-4 md:px-8 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <Image src="/icon.png" alt="InkWise Icon" width={28} height={28} className="object-contain" />
        <Image src="/logo.png" alt="InkWise" width={110} height={36} className="object-contain" />
      </div>
      
      <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
        <Lock className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
        <span className="text-[11px] font-medium text-slate-600 hidden sm:inline">Processed locally. Nothing is uploaded.</span>
        <span className="text-[11px] font-medium text-slate-600 sm:hidden">Local only</span>
      </div>
    </header>
  );
}
