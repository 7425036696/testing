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
		<nav className="glass-effect border-b border-gray-800/50 sticky top-0 z-50">
			<div className="max-w-screen-xl mx-auto px-4">
				<div className="flex justify-between items-center h-16">
					<Link href="/" className="flex items-center space-x-3 group">
						<span className="accent-text text-2xl font-bold text-white group-hover:scale-105 transition-transform duration-200">
							Thumbly
						</span>
					</Link>{' '}
					<div className="flex items-center gap-4">
						<SignedOut>
							<SignInButton mode="modal">
								<button className="text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-colors duration-200">
									Sign In
								</button>
							</SignInButton>
							<SignUpButton mode="modal">
								<button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium text-sm px-6 py-2.5 hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 hover-lift">
									Get Started
								</button>
							</SignUpButton>
						</SignedOut>
						<SignedIn>
							<div className="flex items-center">
								<UserButton
									appearance={{
										elements: {
											avatarBox:
												'w-9 h-9 rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200',
											userButtonPopoverCard:
												'glass-effect border border-gray-800 shadow-2xl shadow-black/50',
											userButtonPopoverMain: 'bg-transparent',
											userButtonPopoverFooter:
												'bg-transparent border-t border-gray-700',
											userButtonPopoverActionButton:
												'text-gray-300 hover:text-white hover:bg-white/5 rounded-lg',
											userButtonPopoverActionButtonText: 'text-gray-300',
											userPreviewMainIdentifier: 'text-white',
											userPreviewSecondaryIdentifier: 'text-gray-400',
										},
									}}
								/>
							</div>
						</SignedIn>
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
