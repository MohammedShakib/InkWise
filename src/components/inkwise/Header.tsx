import { Lock } from 'lucide-react';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between py-6 px-8 border-b border-gray-100 bg-white">
      <div className="flex flex-col">
        <div className="flex items-center space-x-3 mb-1">
          <Image src="/icon.png" alt="InkWise Icon" width={32} height={32} className="object-contain" />
          <Image src="/logo.png" alt="InkWise" width={120} height={40} className="object-contain" />
        </div>
        <p className="text-sm text-gray-500 mt-1">Make your pages truly white.</p>
      </div>
      
      <div className="mt-4 md:mt-0 flex items-center bg-gray-50 px-4 py-2 rounded-full border border-gray-100 shadow-sm">
        <Lock className="w-4 h-4 text-emerald-600 mr-2" />
        <span className="text-xs font-medium text-gray-700">Processed locally. Nothing is uploaded.</span>
      </div>
    </header>
  );
}
