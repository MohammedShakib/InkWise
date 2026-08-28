import { Lock } from 'lucide-react';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="h-[64px] md:h-[68px] flex items-center justify-between px-4 md:px-8 border-b border-slate-200/60 bg-white/95 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center">
        <Image src="/logo.png" alt="InkWise" width={105} height={32} className="object-contain h-[30px] md:h-[34px] w-auto" priority />
      </div>

      <div className="flex items-center rounded-full border border-slate-200/80 bg-slate-50/80 px-3 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <Lock className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
        <span className="text-[12px] font-medium text-slate-600">
          Processed locally
          <span className="hidden sm:inline">. Nothing is uploaded.</span>
        </span>
      </div>
    </header>
  );
}
