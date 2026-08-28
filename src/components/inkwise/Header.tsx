import { Lock } from 'lucide-react';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/92 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-4 md:h-[72px] md:px-8">
        <Image
          src="/logo.png"
          alt="InkWise"
          width={150}
          height={40}
          priority
          className="h-9 w-auto object-contain md:h-10"
        />

        <div className="flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm shadow-slate-200/60">
          <Lock className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
          <span className="hidden text-[11px] font-medium text-slate-600 sm:inline">
            Processed locally. Nothing is uploaded.
          </span>
          <span className="text-[11px] font-medium text-slate-600 sm:hidden">Local only</span>
        </div>
      </div>
    </header>
  );
}
