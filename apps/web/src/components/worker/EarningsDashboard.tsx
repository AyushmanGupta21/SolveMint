"use client";

export function EarningsDashboard({ address }: { address: string }) {
  return (
    <div className="glass p-8 text-center animate-fade-in">
      <div className="text-4xl mb-4">💰</div>
      <h3 className="font-bold text-white text-xl mb-2">Earnings Overview</h3>
      <p className="text-slate-400 text-sm mb-6">
        Your on-chain rewards are paid directly to your wallet when consensus is
        reached. Check your wallet balance for received payments.
      </p>

      <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
        <div className="glass p-4 rounded-xl text-center">
          <p className="text-2xl font-bold gradient-text">∞</p>
          <p className="text-slate-500 text-xs mt-1">Tasks Available</p>
        </div>
        <div className="glass p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-accent-400">Auto</p>
          <p className="text-slate-500 text-xs mt-1">Payout Mode</p>
        </div>
      </div>

      <p className="text-slate-600 text-xs mt-6 font-mono break-all">
        {address}
      </p>
    </div>
  );
}
