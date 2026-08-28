import { Lock } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between py-6 px-8 border-b border-gray-100 bg-white">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">InkWise</h1>
        <p className="text-sm text-gray-500 mt-1">Make your pages truly white.</p>
      </div>
      
      <div className="mt-4 md:mt-0 flex items-center bg-gray-50 px-4 py-2 rounded-full border border-gray-100 shadow-sm">
        <Lock className="w-4 h-4 text-emerald-600 mr-2" />
        <span className="text-xs font-medium text-gray-700">Processed locally. Nothing is uploaded.</span>
      </div>
    </header>
  );
}
