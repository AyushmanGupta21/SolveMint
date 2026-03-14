import Head from "next/head";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <>
      <Head>
        <title>SolveMint — Decentralised AI Data Labeling</title>
        <meta
          name="description"
          content="Earn crypto by labeling AI datasets. No middlemen, just transparent on-chain rewards."
        />
      </Head>

      <Navbar />

      <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
        {/* Glow orbs */}
        <div
          className="glow-orb w-[600px] h-[600px] -top-40 left-1/2 -translate-x-1/2 opacity-20"
          style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}
        />
        <div
          className="glow-orb w-[400px] h-[400px] bottom-0 right-10 opacity-10"
          style={{ background: "radial-gradient(circle, #34d399 0%, transparent 70%)" }}
        />

        {/* Hero */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse-slow" />
            Web3 × AI Data Labeling Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            Label AI Data.{" "}
            <span className="gradient-text">Earn Crypto.</span>
          </h1>

          <p className="text-slate-400 text-xl leading-relaxed max-w-2xl mx-auto mb-12">
            SolveMint connects companies who need AI training data labeled with
            workers who earn rewards on-chain — no middlemen, transparent
            consensus, automatic payouts.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/company" className="btn-primary text-base px-8 py-3.5 shadow-xl shadow-brand-600/25">
              🏢 Post a Task
            </Link>
            <Link href="/worker" className="btn-secondary text-base px-8 py-3.5">
              💼 Start Earning
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto px-6 mt-24 pb-20 animate-slide-up">
          {[
            {
              icon: "🔐",
              title: "Trustless Escrow",
              desc: "Reward funds are locked on-chain when a task is created. Smart contract releases payments on consensus — no trust required.",
            },
            {
              icon: "🧠",
              title: "Majority Consensus",
              desc: "Workers who match the majority answer are automatically rewarded. Minority answers lose nothing — just the reward.",
            },
            {
              icon: "⚡️",
              title: "Instant Payouts",
              desc: "When consensus is reached the contract distributes rewards in the same transaction. No waiting, no withdrawal requests.",
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="glass-hover p-6">
              <div className="text-3xl mb-4">{icon}</div>
              <h3 className="font-bold text-white mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
