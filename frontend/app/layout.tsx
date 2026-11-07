import type { Metadata } from "next";
import "./globals.css";
import { Sparkles, Github, Layers, Activity } from "lucide-react";

export const metadata: Metadata = {
  title: "DataPulse • Real-Time Collaborative Analytics",
  description: "Upload any tabular dataset, compute instant descriptive statistics, and explore interactive charts in real time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col antialiased selection:bg-blue-500/30 selection:text-blue-200">
        {/* Ambient Top Glow */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[250px] bg-gradient-to-b from-blue-600/10 via-indigo-600/5 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* Global Navigation Header */}
        <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3.5">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300" />
                <div className="relative w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-white shadow-md">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold tracking-tight text-white">
                    DataPulse
                  </h1>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-400 border border-blue-500/20">
                    Analytics Pro
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  FastAPI &bull; Pandas &bull; Supabase &bull; Recharts
                </p>
              </div>
            </div>

            {/* Right Header Navigation & Actions */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono">v1.0.0 Production Ready</span>
              </div>

              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800/80 transition"
                title="View on GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Clean Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/80 backdrop-blur py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-slate-400">
              DataPulse &copy; {new Date().getFullYear()} &bull; Built with Next.js, FastAPI & Supabase.
            </p>
            <div className="flex items-center space-x-4 text-[11px] text-slate-500">
              <span>PostgreSQL JSONB</span>
              <span>&bull;</span>
              <span>Pandas Analytics Engine</span>
              <span>&bull;</span>
              <span>Recharts Visualization</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
