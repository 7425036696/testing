'use client';
import React from 'react';
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="backdrop-blur-xl bg-gradient-to-br from-slate-950/80 via-blue-950/70 to-slate-900/80 border-b border-blue-900/40 shadow-lg shadow-blue-900/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 flex items-center justify-center text-white text-2xl font-extrabold group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/30 border-2 border-blue-400/30 group-hover:border-blue-400/60">
              C
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-blue-400 transition-all duration-300 tracking-tight drop-shadow-lg">
              Craftix
            </span>
          </Link>

          {/* Auth */}
          <div className="flex items-center gap-6">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-5 py-2 rounded-xl text-base font-semibold text-slate-200 border border-slate-700 hover:border-blue-400/60 hover:text-white hover:bg-slate-800/60 bg-slate-900/40 backdrop-blur-md transition-all duration-300 shadow hover:shadow-blue-400/10 focus:outline-none focus:ring-2 focus:ring-blue-400/40">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-6 py-2.5 rounded-xl text-base font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:via-cyan-400 hover:to-blue-500 text-white shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/40">
                  Get Started
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox:
                      'w-10 h-10 rounded-full border-2 border-blue-400/30 hover:border-blue-400/60 hover:scale-110 transition-all duration-300 shadow-lg shadow-blue-500/10',
                    userButtonPopoverCard:
                      'backdrop-blur-xl bg-slate-900/90 border border-blue-900/40 shadow-xl shadow-blue-500/10',
                    userButtonPopoverActionButton:
                      'hover:bg-slate-800/60 text-base rounded-xl transition-colors duration-200 text-slate-200 hover:text-white',
                    userPreviewMainIdentifier: 'text-white font-bold',
                    userPreviewSecondaryIdentifier: 'text-slate-400',
                  },
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;