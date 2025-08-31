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

	// Project not found
	if (!project) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-white mb-2">
						Project Not Found
					</h1>
					<p className="text-gray-400 mb-4">
						The project you&apos;re looking for doesn&apos;t exist.
					</p>
					<button
						onClick={() => router.push('/dashboard')}
						className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg">
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
		<div className="flex min-h-screen bg-[#0a0a0a]">
			<Sidebar />
			<div className="flex-1">
				<Topbar
					title={
						<div className="flex items-center space-x-3">
							<span className="text-2xl">{getProjectIcon()}</span>
							<div>
								<h1 className="text-xl font-bold">{project.name}</h1>
								<p className="text-sm text-gray-400 capitalize">
									{project.type} • {project.aspectRatio}
								</p>
							</div>
						</div>
					}
				/>

				<div className="p-6 space-y-6">
					{/* Project Info */}
					<div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-4">
								<div className="text-3xl">{getProjectIcon()}</div>
								<div>
									<h2 className="text-lg font-semibold text-white">
										{project.name}
									</h2>
									<p className="text-sm text-gray-400 capitalize">
										{project.type} Project • {project.aspectRatio} aspect ratio
									</p>
								</div>
							</div>
							<div className="flex items-center space-x-3">
								<button
									onClick={() => router.push('/dashboard')}
									className="text-gray-400 hover:text-white transition-colors text-sm">
									← Back to Dashboard
								</button>
								<button
									onClick={() => setShowConversationHistory(true)}
									className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
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
						<div className="flex items-center justify-center py-12">
							<div className="flex items-center space-x-3">
								<div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
								<span className="text-gray-300 font-medium">
									Generating thumbnails...
								</span>
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
