'use client';

import { useAuth, UserProfile } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function Settings() {
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
				<div className="p-6">
					<div className="bg-gradient-to-r from-slate-900/60 via-blue-950/40 to-slate-900/60 backdrop-blur-xl rounded-lg border border-blue-900/30 p-6 shadow-lg shadow-blue-900/10">
						<div className="mb-6">
							<h2 className="text-lg font-semibold text-white mb-2">
								Account Settings
							</h2>
							<p className="text-sm text-gray-400">
								Manage your profile and account preferences
							</p>
						</div>

						{/* Clerk UserProfile Component */}
						<div className="flex justify-center">
							<UserProfile
								appearance={{
									elements: {
										rootBox: 'w-full max-w-2xl',
										card: 'border border-gray-200 rounded-lg shadow-none',
									},
								}}
							/>
						</div>

						{/* Additional Settings Sections */}
						<div className="mt-8 space-y-6">
							<div className="border-t border-blue-900/30 pt-6">
								<h3 className="text-md font-medium text-white mb-4">
									Thumbnail Preferences
								</h3>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div>
											<label className="text-sm font-medium text-gray-300">
												Default Output Format
											</label>
											<p className="text-xs text-gray-500">
												Choose your preferred image format
											</p>
										</div>
										<select className="bg-slate-900/60 border border-blue-900/40 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
											<option value="jpg">JPG</option>
											<option value="png">PNG</option>
											<option value="webp">WebP</option>
										</select>
									</div>

									<div className="flex items-center justify-between">
										<div>
											<label className="text-sm font-medium text-gray-300">
												Default Quality
											</label>
											<p className="text-xs text-gray-500">
												Higher quality means larger file size
											</p>
										</div>
										<select className="bg-slate-900/60 border border-blue-900/40 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
											<option value="high">High (1920x1080)</option>
											<option value="medium">Medium (1280x720)</option>
											<option value="low">Low (854x480)</option>
										</select>
									</div>

									<div className="flex items-center justify-between">
										<div>
											<label className="text-sm font-medium text-gray-300">
												Auto-save to History
											</label>
											<p className="text-xs text-gray-500">
												Automatically save generated thumbnails
											</p>
										</div>
										<input
											type="checkbox"
											defaultChecked
											className="w-4 h-4 text-blue-500 bg-slate-900/60 border-blue-900/40 rounded focus:ring-blue-500"
										/>
									</div>
								</div>
							</div>

							<div className="border-t border-blue-900/30 pt-6">
								<h3 className="text-md font-medium text-white mb-4">
									Notifications
								</h3>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div>
											<label className="text-sm font-medium text-gray-300">
												Email Notifications
											</label>
											<p className="text-xs text-gray-500">
												Receive updates about new features
											</p>
										</div>
										<input
											type="checkbox"
											defaultChecked
											className="w-4 h-4 text-blue-500 bg-slate-900/60 border-blue-900/40 rounded focus:ring-blue-500"
										/>
									</div>

									<div className="flex items-center justify-between">
										<div>
											<label className="text-sm font-medium text-gray-300">
												Generation Complete
											</label>
											<p className="text-xs text-gray-500">
												Get notified when thumbnails are ready
											</p>
										</div>
										<input
											type="checkbox"
											defaultChecked
											className="w-4 h-4 text-blue-500 bg-slate-900/60 border-blue-900/40 rounded focus:ring-blue-500"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}