"use client";
import React from "react";

export const FloatingTaskCards = () => {
  return (
    <div className="absolute right-0 top-0 bottom-0 w-full md:w-[50vw] pointer-events-none flex items-center justify-center z-10 hidden md:flex">
      {/* Container for the cluster to maintain relative positioning */}
      <div className="relative w-[500px] h-[500px]">
        
        {/* Card 3: Background - RLHF Training */}
        <div className="absolute top-[15%] right-[5%] w-72 bg-[#1A1A24]/60 backdrop-blur-md border border-[#8A2BE2]/30 rounded-2xl p-5 shadow-2xl animate-[float_6s_ease-in-out_infinite_1s]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-white font-semibold text-lg">RLHF Training</h3>
            <span className="bg-[#8A2BE2]/20 text-[#D8B4E2] text-xs font-bold px-2 py-1 rounded-full border border-[#8A2BE2]/50">
              +120 $SOLVE
            </span>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 bg-black/40 rounded-lg p-3 flex flex-col items-center justify-center border border-white/5 hover:bg-black/60 transition-colors">
              <span className="text-2xl mb-1">👍</span>
              <span className="text-xs text-gray-400">Response A</span>
            </div>
            <div className="flex-1 bg-black/40 rounded-lg p-3 flex flex-col items-center justify-center border border-white/5 hover:bg-black/60 transition-colors">
              <span className="text-2xl mb-1">👎</span>
              <span className="text-xs text-gray-400">Response B</span>
            </div>
          </div>
        </div>

        {/* Card 2: Middle - Sentiment Analysis */}
        <div className="absolute top-[45%] left-[-5%] w-72 bg-[#1A1A24]/70 backdrop-blur-md border border-[#8A2BE2]/40 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-[float_5s_ease-in-out_infinite_0.5s]">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-white font-semibold text-lg">Sentiment Analysis</h3>
            <span className="bg-[#1bd668]/20 text-[#1bd668] text-xs font-bold px-2 py-1 rounded-full border border-[#1bd668]/50">
              +15 $SOLVE
            </span>
          </div>
          <div className="bg-black/40 rounded-lg p-3 border border-white/5">
            <p className="text-gray-300 text-sm font-medium italic">"The new UI is incredibly fast."</p>
            <div className="mt-3 flex gap-2">
              <span className="bg-green-500/20 text-green-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-green-500/30">Positive</span>
              <span className="bg-white/5 text-gray-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-white/10 hidden lg:inline">Neutral</span>
              <span className="bg-white/5 text-gray-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-white/10 hidden lg:inline">Negative</span>
            </div>
          </div>
        </div>

        {/* Card 1: Foreground - Image Segmentation */}
        <div className="absolute top-[25%] left-[20%] w-[320px] bg-[#1A1A24]/80 backdrop-blur-xl border border-[#8A2BE2]/60 rounded-2xl p-5 shadow-[0_16px_48px_rgba(0,0,0,0.6)] animate-[float_4s_ease-in-out_infinite]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-white font-bold text-xl">Image Segmentation</h3>
            <span className="bg-[#8A2BE2]/30 text-[#E0B0FF] text-sm font-bold px-2.5 py-1 rounded-full border border-[#8A2BE2] shadow-[0_0_10px_rgba(138,43,226,0.3)]">
              +50 $SOLVE
            </span>
          </div>
          <div className="relative w-full aspect-video bg-[#0D0D12] rounded-lg border border-white/10 overflow-hidden flex items-center justify-center group">
            <svg className="w-12 h-12 text-gray-600 group-hover:text-gray-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {/* Mock Bounding Box */}
            <div className="absolute top-[20%] left-[30%] w-[40%] h-[50%] border-2 border-[#1bd668] border-dashed rounded-sm bg-[#1bd668]/10 flex items-start justify-end p-1">
               <div className="w-2 h-2 bg-[#1bd668] rounded-full"></div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};
