'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Sidebar() {
	const pathname = usePathname();

	const navItems = [
		{ name: 'Dashboard', href: '/dashboard', icon: '📊' },
		{ name: 'Recents', href: '/history', icon: '📋' },
		{ name: 'Gallery', href: '/gallery', icon: '🖼️' },
		{ name: 'Settings', href: '/settings', icon: '⚙️' },
	];

	return (
		<div className="w-64 bg-[#0a0a0a] border-r border-gray-800 text-white min-h-screen flex flex-col">
			{/* Navigation */}
			<nav className="flex-1 p-6">
				<ul className="space-y-2">
					{navItems.map((item) => (
						<li key={item.name}>
							<Link
								href={item.href}
								className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
									pathname === item.href
										? 'bg-orange-500 text-white'
										: 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
								}`}>
								<span className="text-lg">{item.icon}</span>
								<span className="font-medium">{item.name}</span>
							</Link>
						</li>
					))}
				</ul>
			</nav>

			{/* Footer */}
			<div className="p-6 border-t border-gray-800">
				<p className="text-xs text-gray-500 text-center">
					© 2025 Thumbly AI
				</p>
			</div>
		</div>
	);
}
