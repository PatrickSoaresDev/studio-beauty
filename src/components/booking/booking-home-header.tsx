"use client";

import { Sparkles } from "lucide-react";

export function BookingHomeHeader() {
  return (
    <header className="bg-linear-to-r from-rose-400 to-pink-500 pt-16 pb-24 px-6 text-center shadow-md">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-white/30">
          <Sparkles className="text-white drop-shadow-md" size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm mb-4">
          Studio Beauty
        </h1>
        <p className="text-rose-50 text-lg md:text-xl max-w-lg font-medium opacity-90">
          Reserve seu momento de cuidado e beleza de forma rápida e prática.
        </p>
      </div>
    </header>
  );
}
