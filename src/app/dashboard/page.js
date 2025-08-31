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
			{/* Animated background elements */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
				<div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
				<div className="absolute top-1/2 right-1/3 w-64 h-64 bg-blue-600/3 rounded-full blur-3xl animate-pulse delay-2000"></div>
			</div>

			<Sidebar />
			<div className="flex-1 relative">
				<Topbar title="Dashboard" />

				<div className="p-6 space-y-8 relative z-10">
					{/* Welcome Section */}
					<div className="bg-gradient-to-r from-slate-900/60 via-blue-950/40 to-slate-900/60 backdrop-blur-xl border border-blue-900/30 rounded-2xl p-8 shadow-xl shadow-blue-900/10">
						<div className="flex items-center justify-between">
							<div>
								<h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent mb-2">
									Welcome back to Craftix
								</h1>
								<p className="text-slate-400 text-lg">
									Continue building amazing projects with our powerful tools
								</p>
							</div>
							<div className="hidden md:block">
								<div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-blue-500/30 border-2 border-blue-400/30">
									C
								</div>
							</div>
						</div>
					</div>

					{/* Project Type Selector */}
					<div className="bg-gradient-to-r from-slate-900/40 via-blue-950/30 to-slate-900/40 backdrop-blur-xl border border-blue-900/20 rounded-2xl p-6 shadow-lg shadow-blue-900/5">
						<h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
							<div className="w-6 h-6 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400"></div>
							Create New Project
						</h2>
						<ProjectTypeSelector />
					</div>

					{/* Recent Projects */}
					
				</div>
			</div>
		</div>
	);
}