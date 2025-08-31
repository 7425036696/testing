'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import UploadForm from '@/components/UploadForm';
import ThumbnailGrid from '@/components/ThumbnailGrid';
import GenerationStatus from '@/components/GenerationStatus';
import ConversationHistory from '@/components/ConversationHistory';

export default function ProjectPage() {
	const { isLoaded, isSignedIn } = useAuth();
	const router = useRouter();
	const params = useParams();
	const projectId = params.projectId;

	const [isLoading, setIsLoading] = useState(false);
	const [thumbnails, setThumbnails] = useState([]);
	const [generationStatus, setGenerationStatus] = useState(null);
	const [project, setProject] = useState(null);
	const [projectLoading, setProjectLoading] = useState(true);
	const [editingThumbnail, setEditingThumbnail] = useState(null); // For edit mode
	const [showConversationHistory, setShowConversationHistory] = useState(false);

	const refreshProjectImages = async () => {
		try {
			const response = await fetch(`/api/projects/${projectId}/images`);
			if (response.ok) {
				const data = await response.json();
				setThumbnails(data.thumbnails || []);
				console.log('🔄 Refreshed project images from database');
			}
		} catch (error) {
			console.error('Error refreshing project images:', error);
		}
	};

	useEffect(() => {
		const fetchProject = async () => {
			try {
				const response = await fetch(`/api/projects/${projectId}`);
				if (response.ok) {
					const data = await response.json();
					setProject(data.project);

					// Fetch images from the new images API
					fetchProjectImages();
				} else {
					// Project not found or access denied
					router.push('/dashboard');
				}
			} catch (error) {
				console.error('Error fetching project:', error);
				router.push('/dashboard');
			} finally {
				setProjectLoading(false);
			}
		};

		const fetchProjectImages = async () => {
			try {
				const response = await fetch(`/api/projects/${projectId}/images`);
				if (response.ok) {
					const data = await response.json();
					setThumbnails(data.thumbnails || []);
				}
			} catch (error) {
				console.error('Error fetching project images:', error);
			}
		};

		if (isSignedIn && projectId) {
			fetchProject();
		}
	}, [isSignedIn, projectId, router]);

	// Handle loading state
	if (!isLoaded || projectLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
				<div className="flex flex-col items-center gap-4">
					<div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-blue-500/30"></div>
					<p className="text-slate-300 font-medium">Loading project...</p>
				</div>
			</div>
		);
	}

	// Redirect if not signed in
	if (!isSignedIn) {
		router.push('/sign-in');
		return null;
	}

	// Project not found
	if (!project) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
				<div className="text-center backdrop-blur-xl bg-slate-900/40 border border-blue-900/40 rounded-2xl p-8 shadow-xl shadow-blue-500/10">
					<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center">
						<svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
						</svg>
					</div>
					<h1 className="text-2xl font-bold text-white mb-3">
						Project Not Found
					</h1>
					<p className="text-slate-300 mb-6 max-w-md">
						The project you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
					</p>
					<button
						onClick={() => router.push('/dashboard')}
						className="px-6 py-3 rounded-xl text-base font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:via-cyan-400 hover:to-blue-500 text-white shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/40">
						Back to Dashboard
					</button>
				</div>
			</div>
		);
	}

	const handleGenerate = async (
		fileOrThumbnail,
		originalPrompt,
		refinedPrompt = null,
		useRefinedPrompt = false,
		isEditMode = false
	) => {
		if (!fileOrThumbnail || !originalPrompt) return;

		setIsLoading(true);
		try {
			let fileData;

			if (isEditMode && fileOrThumbnail.url) {
				// Edit mode: convert thumbnail URL to base64
				const response = await fetch(fileOrThumbnail.url);
				const blob = await response.blob();
				const base64 = await new Promise((resolve) => {
					const reader = new FileReader();
					reader.onloadend = () => resolve(reader.result);
					reader.readAsDataURL(blob);
				});

				fileData = {
					data: base64,
					name: `edited_${fileOrThumbnail.id || 'thumbnail'}.jpg`,
					type: 'image/jpeg',
					size: blob.size,
				};
			} else {
				// Regular mode: convert uploaded file to base64
				const base64File = await new Promise((resolve, reject) => {
					const reader = new FileReader();
					reader.readAsDataURL(fileOrThumbnail);
					reader.onload = () => resolve(reader.result);
					reader.onerror = (error) => reject(error);
				});

				fileData = {
					data: base64File,
					name: fileOrThumbnail.name,
					type: fileOrThumbnail.type,
					size: fileOrThumbnail.size,
				};
			}

			const response = await fetch('/api/generate-thumbnail', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					projectId: projectId,
					prompt: originalPrompt,
					refinedPrompt: refinedPrompt,
					useRefinedPrompt: useRefinedPrompt,
					file: fileData,
					isEditMode: isEditMode,
					originalThumbnailId: isEditMode ? fileOrThumbnail.id : undefined,
				}),
			});

			if (response.ok) {
				const data = await response.json();

				// Refresh thumbnails from database instead of using response data
				await refreshProjectImages();

				// Update generation status
				setGenerationStatus({
					promptUsed:
						data.promptUsed ||
						(useRefinedPrompt && refinedPrompt
							? refinedPrompt
							: originalPrompt),
					wasRefined:
						data.wasRefined ||
						(useRefinedPrompt &&
							refinedPrompt &&
							refinedPrompt !== originalPrompt),
					timestamp: new Date().toISOString(),
				});

				// If we were editing, exit edit mode
				if (isEditMode) {
					setEditingThumbnail(null);
				}

				// Log the prompt used for transparency
				console.log('Generation completed:', {
					originalPrompt,
					refinedPrompt,
					promptUsed: data.promptUsed,
					wasRefined: data.wasRefined,
					isEditMode,
				});
			}
		} catch (error) {
			console.error('Error generating thumbnails:', error);
		}
		setIsLoading(false);
	};

	const handleDownloadAll = () => {
		// TODO: Implement ZIP download functionality
		console.log('Download all thumbnails as ZIP');
	};

	const handleDeleteThumbnail = async (thumbnailId) => {
		try {
			const response = await fetch(`/api/delete-thumbnail?id=${thumbnailId}`, {
				method: 'DELETE',
			});

			if (response.ok) {
				// Remove the thumbnail from the local state
				setThumbnails((prev) =>
					prev.filter((thumb) => thumb.id !== thumbnailId)
				);
				console.log(`Thumbnail ${thumbnailId} deleted successfully`);
			} else {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to delete thumbnail');
			}
		} catch (error) {
			console.error('Error deleting thumbnail:', error);
			throw error; // Re-throw to be caught by the component
		}
	};

	const handleEditThumbnail = (thumbnail) => {
		setEditingThumbnail(thumbnail);
		// The UploadForm will need to handle the edit mode
		console.log('Edit thumbnail:', thumbnail);
	};

	const handleCancelEdit = () => {
		setEditingThumbnail(null);
	};

	const handleResetConversation = () => {
		// Refresh thumbnails after conversation reset
		refreshProjectImages();
	};

	const getProjectIcon = () => {
		return project.type === 'youtube' ? '📺' : '📱';
	};

	return (
		<div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
			<Sidebar />
			<div className="flex-1">
				<Topbar
					title={
						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 flex items-center justify-center text-white text-lg font-extrabold shadow-lg shadow-blue-500/30 border-2 border-blue-400/30">
								{getProjectIcon()}
							</div>
							<div>
								<h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">{project.name}</h1>
								<p className="text-sm text-slate-400 capitalize font-medium">
									{project.type} • {project.aspectRatio}
								</p>
							</div>
						</div>
					}
				/>

				<div className="p-6 space-y-6">
					{/* Project Info */}
					<div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/60 via-blue-950/50 to-slate-900/60 border border-blue-900/40 rounded-2xl p-6 shadow-xl shadow-blue-500/10">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-5">
								<div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500/20 via-cyan-400/20 to-blue-500/20 border border-blue-400/30 flex items-center justify-center text-3xl shadow-lg shadow-blue-500/20">
									{getProjectIcon()}
								</div>
								<div>
									<h2 className="text-xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
										{project.name}
									</h2>
									<p className="text-slate-400 capitalize font-medium">
										{project.type} Project • {project.aspectRatio} aspect ratio
									</p>
								</div>
							</div>
							<div className="flex items-center space-x-4">
								<button
									onClick={() => router.push('/dashboard')}
									className="px-4 py-2 rounded-xl text-slate-300 hover:text-white border border-slate-700 hover:border-blue-400/60 hover:bg-slate-800/60 bg-slate-900/40 backdrop-blur-md transition-all duration-300 shadow hover:shadow-blue-400/10 focus:outline-none focus:ring-2 focus:ring-blue-400/40 font-medium flex items-center gap-2">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
									</svg>
									Back to Dashboard
								</button>
								<button
									onClick={() => setShowConversationHistory(true)}
									className="px-5 py-2.5 rounded-xl text-base font-bold bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600 hover:from-purple-500 hover:via-indigo-400 hover:to-purple-500 text-white shadow-lg hover:shadow-purple-500/30 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2"
									disabled={thumbnails.length === 0}>
									<svg
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.964L3 20l1.036-5.874A8.955 8.955 0 013 12a8 8 0 1118 0z"
										/>
									</svg>
									<span>Conversation History</span>
								</button>
							</div>
						</div>
					</div>

					{/* Generation Status */}
					<GenerationStatus
						promptUsed={generationStatus?.promptUsed}
						wasRefined={generationStatus?.wasRefined}
						isLoading={isLoading}
					/>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Upload Form */}
						<UploadForm
							onGenerate={handleGenerate}
							isLoading={isLoading}
							projectType={project.type}
							aspectRatio={project.aspectRatio}
							hasGeneratedThumbnails={thumbnails.length > 0}
							lastGeneratedImage={thumbnails.length > 0 ? thumbnails[0] : null}
							editingThumbnail={editingThumbnail}
							onCancelEdit={handleCancelEdit}
						/>

						{/* Thumbnail Results */}
						<ThumbnailGrid
							thumbnails={thumbnails}
							onDeleteThumbnail={handleDeleteThumbnail}
							onEditThumbnail={handleEditThumbnail}
							isLoading={isLoading}
							projectType={project.type}
							projectId={projectId}
						/>
					</div>

					{/* Loading State */}
					{isLoading && (
						<div className="flex items-center justify-center py-16">
							<div className="backdrop-blur-xl bg-slate-900/40 border border-blue-900/40 rounded-2xl p-8 shadow-xl shadow-blue-500/10">
								<div className="flex flex-col items-center space-y-4">
									<div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-blue-500/30"></div>
									<span className="text-slate-200 font-bold text-lg bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
										Generating thumbnails...
									</span>
									<div className="w-32 h-1 bg-slate-800 rounded-full overflow-hidden">
										<div className="w-full h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 animate-pulse"></div>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Conversation History Modal */}
			<ConversationHistory
				projectId={projectId}
				isVisible={showConversationHistory}
				onClose={() => setShowConversationHistory(false)}
				onResetConversation={handleResetConversation}
			/>
		</div>
	);
}