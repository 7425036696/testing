'use client';

import { useUser } from '@clerk/nextjs';

export default function Topbar({ title = 'Dashboard' }) {
	const { user } = useUser();

	return (
		<div className="bg-gradient-to-r from-slate-950/80 via-blue-950/70 to-slate-900/80 backdrop-blur-xl border-b border-blue-900/40 p-4 flex items-center justify-between shadow-lg shadow-blue-900/10">
			<div>
				{typeof title === 'string' ? (
					<h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">{title}</h1>
				) : (
					<div className="text-white">{title}</div>
				)}
				{user && (
					<p className="text-slate-400">
						Welcome back, {user.firstName || 'Creator'}! 👋
					</p>
				)}
			</div>
			<div className="flex items-center space-x-4"></div>
		</div>
	);
}