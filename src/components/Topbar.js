'use client';

import { useUser } from '@clerk/nextjs';

export default function Topbar({ title = 'Dashboard' }) {
	const { user } = useUser();

	return (
		<div className="bg-[#111111] border-b border-gray-800 p-4 flex items-center justify-between">
			<div>
				{typeof title === 'string' ? (
					<h1 className="text-2xl font-bold text-white">{title}</h1>
				) : (
					<div className="text-white">{title}</div>
				)}
				{user && (
					<p className="text-gray-400">
						Welcome back, {user.firstName || 'Creator'}! 👋
					</p>
				)}
			</div>
			<div className="flex items-center space-x-4"></div>
		</div>
	);
}
