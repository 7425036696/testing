'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import ThumbnailGallery from '@/components/ThumbnailGallery';

export default function Gallery() {
	const { isLoaded, isSignedIn } = useAuth();
	const router = useRouter();

	// Handle loading state
	if (!isLoaded) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
				<div className="flex flex-col items-center gap-4">
					<div className="w-12 h-12 border-3 border-blue-400 border-t-transparent rounded-full animate-spin shadow-lg shadow-blue-500/30"></div>
					<div className="text-xl font-semibold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
						Loading Craftix...
					</div>
				</div>
			</div>
		);
	}

	// Redirect if not signed in
	if (!isSignedIn) {
		router.push('/sign-in');
		return null;
	}

	return (
		<div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/90 to-slate-900">
			<Sidebar />
			<div className="flex-1">
				<Topbar title="Gallery" />

				<div className="p-6 space-y-8">
					{/* Thumbnail Gallery */}
					<ThumbnailGallery />
				</div>
			</div>
		</div>
	);
}