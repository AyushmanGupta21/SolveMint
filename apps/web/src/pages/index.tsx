import Head from "next/head";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'data-labeling' | 'ai-training' | 'crypto-rewards'>('data-labeling');

  const tabs = [
    { id: 'data-labeling', label: 'Data Labeling' },
    { id: 'ai-training', label: 'AI Training' },
    { id: 'crypto-rewards', label: 'Crypto Rewards' },
  ] as const;

  const content = {
    'data-labeling': {
      title: 'Data Labeling',
      description: 'Classify This Image\nImage: animal picture\nQuestion:',
      pointsHeading: 'Reward:',
      points: ['0.02 ETH per correct answer'],
      image: '/data-labeling.jpeg'
    },
    'ai-training': {
      title: 'AI Training',
      description: 'Help improve machine learning models by verifying predictions, ranking outputs, or correcting AI mistakes.',
      pointsHeading: 'Example Tasks:',
      points: ['Model Prediction Review', 'Text Response Ranking', 'Object Detection Validation'],
      image: '/ai-training.jpeg'
    },
    'crypto-rewards': {
      title: 'Crypto Rewards',
      description: 'Earn cryptocurrency rewards for completing micro-tasks that help train and improve AI systems across the platform.',
      pointsHeading: 'Reward System:',
      points: ['Smart contract based payments', 'Instant blockchain verification', 'Transparent reward distribution'],
      image: '/crypto-rewards.jpeg'
    }
  };

  return (
    <>
      <Head>
        <title>SolveMint — Decentralised AI Data Labeling</title>
        <meta
          name="description"
          content="Label data, train AI models, and earn crypto rewards through a transparent blockchain-powered platform."
        />
      </Head>

      <div className="min-h-screen bg-[#111111] text-white font-sans flex flex-col">
        {/* Navbar */}
        <header className="flex justify-between items-center p-6">
          <div className="flex items-center">
            <img src="/solvemint-logo.png" alt="SolveMint" className="h-8" />
          </div>
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
              const ready = mounted;
              const connected = ready && account && chain;
              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <Link href="/signin">
                          <button className="bg-[#31204d] border border-[#6b47a1] text-white font-medium text-sm py-1.5 px-4 rounded-full hover:bg-[#3d2761] transition-colors">
                            Sign in / Sign up
                          </button>
                        </Link>
                      );
                    }
                    if (chain.unsupported) {
                      return (
                        <button onClick={openChainModal} className="bg-red-500 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-red-600 transition-colors">
                          Wrong network
                        </button>
                      );
                    }
                    return (
                      <div className="flex gap-3">
                        <button onClick={openChainModal} className="bg-[#2A2A2A] text-white font-bold py-2.5 px-4 rounded-lg flex items-center gap-2 hover:bg-[#333333] transition-colors">
                          {chain.hasIcon && chain.iconUrl && (
                            <img alt={chain.name ?? 'Chain icon'} src={chain.iconUrl} className="w-5 h-5" />
                          )}
                          {chain.name}
                        </button>
                        <button onClick={openAccountModal} className="bg-[#2A2A2A] text-white font-bold py-2.5 px-4 rounded-lg hover:bg-[#333333] transition-colors">
                          {account.displayName}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </header>

        {/* Hero Section */}
        <main className="min-h-[85vh] flex flex-col justify-center px-10 md:px-24">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-8 font-sans">
              <span className="text-[#888888]">The </span>
              <span className="text-white">decentralized</span>
              <br />
              <span className="text-white">workforce </span>
              <span className="text-[#888888]">powering </span>
              <span className="text-white">AI</span>
            </h1>

            <p className="text-[#BBBBBB] text-xl leading-relaxed max-w-2xl mb-10 font-sans">
              Label data, train AI models, and earn crypto<br />
              rewards through a transparent blockchain-<br />
              powered platform.
            </p>

            <div className="flex">
              <Link href="/signin">
                <button className="group bg-white text-black font-semibold py-1.5 pl-5 pr-1.5 rounded-full flex items-center gap-3 hover:bg-gray-100 transition-colors shadow-lg">
                  <span className="text-[15px]">Connect Wallet</span>
                  <div className="bg-[#6B21A8] text-white p-2 rounded-full flex items-center justify-center group-hover:bg-[#581c87] transition-colors">
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </Link>
            </div>
          </div>
        </main>

        {/* Features Tabs Section */}
        <section className="py-24 px-10 md:px-24 flex flex-col items-center">
          {/* Tabs */}
          <div className="flex gap-12 md:gap-24 mb-20 text-sm md:text-base font-medium">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 outline-none transition-colors border-b ${
                  activeTab === tab.id 
                    ? 'text-white border-white' 
                    : 'text-[#888888] border-transparent hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Box */}
          <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl w-full gap-16 md:gap-24">
            {/* Image Placeholder area */}
            <div className="flex-1 w-full flex items-center justify-center">
              <div className="w-full aspect-[4/3] bg-black bg-opacity-50 flex items-center justify-center relative shadow-2xl rounded-sm overflow-hidden">
                 <img 
                   src={content[activeTab].image}
                   alt={content[activeTab].title}
                   className="w-full h-full object-cover object-center"
                   onError={(e) => {
                     (e.target as HTMLImageElement).style.visibility = 'hidden';
                     (e.target as HTMLImageElement).parentElement?.classList.add('border', 'border-white/5');
                     // fallback if image not found
                   }}
                 />
                 <span className="absolute text-[#555] text-sm -z-10 text-center px-4">
                    [Save as {content[activeTab].image} in public folder]
                 </span>
              </div>
            </div>

            {/* Text Area */}
            <div className="flex-1 flex flex-col justify-center w-full">
              <h2 className="text-2xl font-semibold text-white mb-3">
                {content[activeTab].title}
              </h2>
              <p className="text-[#BBBBBB] leading-relaxed mb-6 whitespace-pre-line text-[15px]">
                {content[activeTab].description}
              </p>
              
              <h3 className="text-white font-semibold mb-2 text-[15px]">
                {content[activeTab].pointsHeading}
              </h3>
              <ul className="text-[#BBBBBB] space-y-1 text-[15px]">
                {content[activeTab].points.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
