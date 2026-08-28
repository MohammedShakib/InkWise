import { ArrowLeft, Lock } from 'lucide-react';
import Image from 'next/image';

interface HeaderProps {
  workspace?: boolean;
  onBack?: () => void;
}

export default function Header({ workspace = false, onBack }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/92 backdrop-blur-md">
      <div
        className={`flex h-16 w-full items-center justify-between px-4 md:h-[72px] ${
          workspace ? 'md:px-6' : 'mx-auto max-w-[1200px] md:px-8'
        }`}
      >
        <div className="flex items-center gap-3">
          {workspace && onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm shadow-slate-200/60 transition-colors hover:border-slate-300 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Upload
            </button>
          )}

          <Image
            src="/logo.png"
            alt="InkWise"
            width={150}
            height={40}
            priority
            className="h-9 w-auto object-contain md:h-10"
          />
        </div>

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
