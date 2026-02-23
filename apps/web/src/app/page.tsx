"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import AddItemForm from "../components/AddItemForm";
import Auth from "../components/Auth";

export default function Home() {
  // This tells Next.js: "Only load this component on the user's browser"
  const Map = useMemo(() => dynamic(
    () => import("../components/Map"),
    { 
      loading: () => (
        <div className="h-[500px] glass-card flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400">Loading map...</p>
          </div>
        </div>
      ),
      ssr: false 
    }
  ), []);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Community Utility Hub</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Rent tools from your neighbors. Save money, reduce waste, and build community connections.
            </p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="premium-card p-6 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Share Resources</h3>
              <p className="text-gray-400">Borrow tools from neighbors instead of buying</p>
            </div>
            
            <div className="premium-card p-6 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Save Money</h3>
              <p className="text-gray-400">Earn by lending your unused tools</p>
            </div>
            
            <div className="premium-card p-6 text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-green-500 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Go Green</h3>
              <p className="text-gray-400">Reduce waste by sharing resources</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Map Section */}
            <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="premium-card">
                <div className="p-4 border-b border-white/10">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Explore Nearby Tools
                  </h2>
                </div>
                <div className="map-container">
                  <Map />
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <div className="sticky top-24 space-y-6">
                {/* Add Item Form */}
                <div className="premium-card p-6">
                  <AddItemForm />
                </div>
                
                {/* Auth Component */}
                <div className="premium-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Account
                  </h3>
                  <Auth />
                </div>
                
                {/* Quick Tips */}
                <div className="premium-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Quick Tips
                  </h3>
                  <ul className="space-y-3 text-gray-400 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400">•</span>
                      Enable location to find tools near you
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400">•</span>
                      List your tools to earn extra income
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400">•</span>
                      Review borrowers for trust
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
