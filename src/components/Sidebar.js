'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Sidebar() {
	const pathname = usePathname();

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: '📈' },   // chart instead of generic graph
  { name: 'History', href: '/history', icon: '📜' },      // scroll/history log
  { name: 'Gallery', href: '/gallery', icon: '🖼️' },      // picture frame (same as before)
  { name: 'Settings', href: '/settings', icon: '🛠️' },   // wrench & hammer for settings
];


	return (
		<div className="w-64 bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900 border-r border-blue-900/40 text-white min-h-screen flex flex-col">
			{/* Navigation */}
			<nav className="flex-1 p-6">
				<ul className="space-y-2">
					{navItems.map((item) => (
						<li key={item.name}>
							<Link
								href={item.href}
								className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
									pathname === item.href
										? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 text-white'
										: 'text-gray-300 hover:bg-slate-800/50 hover:text-white'
								}`}>
								<span className="text-lg">{item.icon}</span>
								<span className="font-medium">{item.name}</span>
							</Link>
						</li>
					))}
				</ul>
			</nav>

			{/* Footer */}
			<div className="p-6 border-t border-blue-900/30">
				<p className="text-xs text-gray-500 text-center">
					© 2025 Craftix AI
				</p>
			</div>
		</div>
	);
}