import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";

export default function SignIn() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [selectedRole, setSelectedRole] = useState<'creator' | 'solver' | null>(null);

  useEffect(() => {
    if (isConnected && selectedRole) {
      if (selectedRole === 'creator') {
        router.push('/company');
      } else if (selectedRole === 'solver') {
        router.push('/worker');
      }
    }
  }, [isConnected, selectedRole, router]);

  return (
    <>
      <Head>
        <title>Sign In — SolveMint</title>
      </Head>

      <div className="min-h-screen bg-black text-white font-sans flex flex-col relative overflow-hidden">
        {/* Background Glows (Matching Landing Page) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#00ff88]/10 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#a855f7]/20 rounded-full blur-[150px]"></div>
        </div>

        {/* Minimal Navbar */}
        <header className="relative z-10 flex justify-between items-center p-6">
          <Link href="/">
            <img src="/solvemint-logo.png" alt="SolveMint" className="h-8 cursor-pointer" />
          </Link>
        </header>

        {/* Main Content */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Link href="/">
                <button 
                  className="text-[#BBBBBB] hover:text-white transition-colors p-2 rounded-full hover:bg-white/5 flex items-center justify-center outline-none" 
                  title="Back to Home"
                >
                  <svg className="w-5 h-5 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
              </Link>
              <h1 className="text-2xl md:text-4xl font-bold font-sans text-white tracking-tight">
                Welcome to SolveMint
              </h1>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-8 max-w-4xl w-full">
            {/* Task Creator Card */}
            <div className="group relative bg-[#111111]/80 backdrop-blur-md border border-white/10 hover:border-[#a855f7]/50 rounded-3xl p-6 md:p-8 transition-all hover:bg-[#151515] flex flex-col items-center text-center shadow-lg hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]">
              <div className="absolute inset-0 bg-gradient-to-b from-[#a855f7]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none"></div>
              
              <div className="w-16 h-16 bg-[#231536] border border-[#6b47a1]/50 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-[#a855f7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              
              <h2 className="text-xl md:text-2xl font-bold mb-2 text-white">Task Creator</h2>
              <p className="text-[#888888] text-sm md:text-base mb-6 leading-relaxed flex-1">
                Upload datasets, set crypto rewards, and receive high-quality annotations to train your AI models.
              </p>

              {isConnected ? (
                <button
                  onClick={() => router.push('/company')}
                  className="bg-white text-black font-semibold py-3 px-[24px] rounded-full hover:bg-gray-200 transition-colors w-auto"
                >
                  Go to Creator Dashboard
                </button>
              ) : (
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button
                      onClick={() => {
                        setSelectedRole('creator');
                        openConnectModal();
                      }}
                      className="bg-[#31204d] border border-[#6b47a1] text-white font-semibold py-3 px-[24px] rounded-full hover:bg-[#3d2761] transition-colors w-auto"
                    >
                      Connect Wallet
                    </button>
                  )}
                </ConnectButton.Custom>
              )}
            </div>

            {/* Task Solver Card */}
            <div className="group relative bg-[#111111]/80 backdrop-blur-md border border-white/10 hover:border-[#00ff88]/50 rounded-3xl p-6 md:p-8 transition-all hover:bg-[#151515] flex flex-col items-center text-center shadow-lg hover:shadow-[0_0_40px_rgba(0,255,136,0.1)]">
              <div className="absolute inset-0 bg-gradient-to-b from-[#00ff88]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none"></div>

              <div className="w-16 h-16 bg-[#162a22] border border-[#00ff88]/40 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-[#00ff88]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>

              <h2 className="text-xl md:text-2xl font-bold mb-2 text-white">Task Solver</h2>
              <p className="text-[#888888] text-sm md:text-base mb-6 leading-relaxed flex-1">
                Complete micro-tasks, label data, and earn immediate cryptocurrency rewards directly to your wallet.
              </p>

              {isConnected ? (
                <button
                  onClick={() => router.push('/worker')}
                  className="bg-white text-black font-semibold py-3 px-[24px] rounded-full hover:bg-gray-200 transition-colors w-auto"
                >
                  Go to Solver Dashboard
                </button>
              ) : (
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button
                      onClick={() => {
                        setSelectedRole('solver');
                        openConnectModal();
                      }}
                      className="bg-[#162a22] border border-[#00ff88]/40 text-[#00ff88] font-semibold py-3 px-[24px] rounded-full hover:bg-[#1c352b] transition-colors w-auto"
                    >
                      Connect Wallet
                    </button>
                  )}
                </ConnectButton.Custom>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}