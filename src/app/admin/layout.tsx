import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-rose-200 font-sans pb-12">
      <header className="bg-linear-to-r from-rose-400 to-pink-500 px-4 sm:px-6 pt-10 pb-20 shadow-md">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 shrink-0 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-sm border border-white/30">
              <Sparkles className="text-white drop-shadow-md" size={28} />
            </div>
            <div>
              <p className="text-rose-50 text-sm font-medium tracking-wide">Studio Beauty</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
                Painel administrativo
              </h1>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center sm:justify-end text-sm font-semibold text-white/95 hover:text-white bg-white/15 hover:bg-white/25 border border-white/30 rounded-xl px-4 py-2.5 transition-colors backdrop-blur-sm"
          >
            ← Voltar ao site
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 -mt-14 relative z-10">{children}</div>
    </div>
  );
}
