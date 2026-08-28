"use client";

import { Lock } from 'lucide-react';
import Image from 'next/image';
import { useInkWise } from '../../lib/store/InkWiseContext';

export default function Header() {
  const { clearAll } = useInkWise();

  return (
    <div className="absolute top-4 left-4 md:left-6 z-50">
      <button 
        onClick={clearAll} 
        className="block hover:opacity-80 transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
        title="Go to Home"
      >
        <Image src="/logo.png" alt="InkWise" width={105} height={32} className="object-contain h-[26px] md:h-[30px] w-auto mix-blend-multiply" priority />
      </button>
    </div>
  );
}
