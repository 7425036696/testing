'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import ProjectTypeSelector from '@/components/ProjectTypeSelector';
import ProjectList from '@/components/ProjectList';

export default function Dashboard() {
	const { isLoaded, isSignedIn } = useAuth();
	const router = useRouter();

	// Handle loading state
	if (!isLoaded) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
				<div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
			</div>
		);
	}

	// Redirect if not signed in
	if (!isSignedIn) {
		router.push('/sign-in');
		return null;
	}

	return (
		<div className="flex min-h-screen bg-[#0a0a0a]">
			<Sidebar />
			<div className="flex-1">
				<Topbar title="Dashboard" />

				<div className="p-6 space-y-8">
					{/* Project Type Selector */}
					<ProjectTypeSelector />

					{/* Recent Projects */}
					<ProjectList showLimit={6} showViewAll={true} />
				</div>
			</div>
		</div>
	);
}
