'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ThumbnailGallery() {
	const { userId } = useAuth();
	const router = useRouter();
	const [thumbnails, setThumbnails] = useState({ youtube: [], reels: [] });
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('youtube');
	const [stats, setStats] = useState({ totalCount: 0, youtubeCount: 0, reelsCount: 0 });

	useEffect(() => {
		if (userId) {
			fetchThumbnails();
		}
	}, [userId]);

	const fetchThumbnails = async () => {
		try {
			const response = await fetch('/api/gallery');
			if (response.ok) {
				const data = await response.json();
				setThumbnails(data.thumbnails || { youtube: [], reels: [] });
				setStats({
					totalCount: data.totalCount || 0,
					youtubeCount: data.youtubeCount || 0,
					reelsCount: data.reelsCount || 0
				});
			}
		} catch (error) {
			console.error('Error fetching gallery thumbnails:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDownload = async (thumbnail) => {
		try {
			// Fetch the image as a blob to force download
			const response = await fetch(thumbnail.url);
			const blob = await response.blob();

			// Create object URL from blob
			const url = URL.createObjectURL(blob);

			// Create a temporary link element to trigger download
			const link = document.createElement('a');
			link.href = url;

			// Generate a meaningful filename
			const timestamp = new Date(thumbnail.createdAt || Date.now())
				.toISOString()
				.slice(0, 19)
				.replace(/:/g, '-');
			link.download = `${thumbnail.projectType}-thumbnail-${timestamp}.png`;

			// Trigger download
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			// Clean up the object URL
			URL.revokeObjectURL(url);

			console.log('Downloaded thumbnail:', thumbnail._id);
		} catch (error) {
			console.error('Failed to download thumbnail:', error);
			alert('Failed to download thumbnail. Please try again.');
		}
	};

	const handleViewProject = (thumbnail) => {
		router.push(`/project/${thumbnail.projectId}`);
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const getProjectIcon = (type) => {
		return type === 'youtube' ? '📺' : '📱';
	};

	if (isLoading) {
		return (
			<div className="max-w-6xl mx-auto p-6">
				<div className="flex items-center justify-center py-12">
					<div className="flex flex-col items-center gap-4">
						<div className="w-12 h-12 border-3 border-blue-400 border-t-transparent rounded-full animate-spin shadow-lg shadow-blue-500/30"></div>
						<div className="text-xl font-semibold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
							Loading Gallery...
						</div>
					</div>
				</div>
			</div>
		);
	}

	const currentThumbnails = thumbnails[activeTab] || [];

	return (
		<div className="max-w-7xl mx-auto p-6">
			{/* Enhanced Header with Stats */}
			<div className="mb-8">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
						Your Gallery
					</h1>
					<p className="text-gray-400 text-lg">
						All your AI-generated thumbnails in one place
					</p>
				</div>
				
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<div className="bg-gradient-to-br from-slate-900/60 via-blue-950/40 to-slate-900/60 backdrop-blur-xl border border-blue-900/30 rounded-xl p-6 text-center hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
						<div className="text-3xl font-bold text-blue-400 mb-2">{stats.totalCount}</div>
						<div className="text-sm text-gray-300 font-medium">Total Thumbnails</div>
					</div>
					<div className="bg-gradient-to-br from-slate-900/60 via-blue-950/40 to-slate-900/60 backdrop-blur-xl border border-blue-900/30 rounded-xl p-6 text-center hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
						<div className="text-3xl font-bold text-cyan-400 mb-2">{stats.youtubeCount}</div>
						<div className="text-sm text-gray-300 font-medium flex items-center justify-center">
							<span className="mr-1">📺</span>YouTube Thumbnails
						</div>
					</div>
					<div className="bg-gradient-to-br from-slate-900/60 via-blue-950/40 to-slate-900/60 backdrop-blur-xl border border-blue-900/30 rounded-xl p-6 text-center hover:shadow-lg hover:shadow-blue-400/20 transition-all duration-300">
						<div className="text-3xl font-bold text-blue-300 mb-2">{stats.reelsCount}</div>
						<div className="text-sm text-gray-300 font-medium flex items-center justify-center">
							<span className="mr-1">📱</span>Reels Thumbnails
						</div>
					</div>
				</div>
			</div>

			{/* Enhanced Tabs */}
			<div className="mb-8">
				<div className="flex justify-center">
					<div className="flex space-x-2 bg-slate-900/50 p-2 rounded-xl border border-blue-900/30 backdrop-blur-sm">
						<button
							onClick={() => setActiveTab('youtube')}
							className={`flex items-center space-x-3 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
								activeTab === 'youtube'
									? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 scale-105'
									: 'text-gray-400 hover:text-white hover:bg-slate-800/50'
							}`}
						>
							<span className="text-lg">📺</span>
							<div className="text-left">
								<div className="font-semibold">YouTube</div>
								<div className="text-xs opacity-75">{stats.youtubeCount} thumbnails</div>
							</div>
						</button>
						<button
							onClick={() => setActiveTab('reels')}
							className={`flex items-center space-x-3 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
								activeTab === 'reels'
									? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 scale-105'
									: 'text-gray-400 hover:text-white hover:bg-slate-800/50'
							}`}
						>
							<span className="text-lg">📱</span>
							<div className="text-left">
								<div className="font-semibold">Reels</div>
								<div className="text-xs opacity-75">{stats.reelsCount} thumbnails</div>
							</div>
						</button>
					</div>
				</div>
			</div>

			{/* Thumbnails Grid */}
			{currentThumbnails.length === 0 ? (
				<div className="text-center py-16 text-gray-500">
					<div className="text-6xl mb-4">
						{activeTab === 'youtube' ? '📺' : '📱'}
					</div>
					<h3 className="text-xl font-semibold text-gray-400 mb-2">
						No {activeTab === 'youtube' ? 'YouTube' : 'Reels'} thumbnails yet
					</h3>
					<p className="text-gray-500 mb-6">
						Create your first {activeTab === 'youtube' ? 'YouTube' : 'Reels'} project to get started
					</p>
					<button
						onClick={() => router.push('/dashboard')}
						className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
					>
						Create New Project
					</button>
				</div>
			) : (
				<div className={`grid gap-8 ${
					activeTab === 'youtube' 
						? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' 
						: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
				}`}>
					{currentThumbnails.map((thumbnail) => (
						<div
							key={thumbnail._id}
							className="group bg-gradient-to-br from-slate-900/60 via-blue-950/40 to-slate-900/60 backdrop-blur-xl border border-blue-900/30 rounded-xl overflow-hidden hover:border-blue-700/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
						>
							{/* Thumbnail Image with Proper Aspect Ratios */}
							<div className={`relative bg-slate-800 overflow-hidden ${
								activeTab === 'youtube' 
									? 'aspect-[16/9]' 
									: 'aspect-[9/16]'
							}`}>
								<Image
									src={thumbnail.url}
									alt="Generated thumbnail"
									fill
									className="object-cover transition-transform duration-300 group-hover:scale-110"
									sizes={activeTab === 'youtube' 
										? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
										: "(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
									}
								/>
								
								{/* Enhanced Overlay with Gradient */}
								<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
								
								{/* Action Buttons - Positioned at Bottom */}
								<div className="absolute bottom-3 left-3 right-3 flex justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
									<button
										onClick={() => handleDownload(thumbnail)}
										className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white p-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
										title="Download Thumbnail"
									>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
										</svg>
									</button>
									<button
										onClick={() => handleViewProject(thumbnail)}
										className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white p-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
										title="View Project"
									>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M14 4h6m0 0v6m0-6L10 14" />
										</svg>
									</button>
								</div>
							</div>

							{/* Enhanced Thumbnail Info */}
							<div className="p-4 space-y-2">
								<div className="flex items-start justify-between">
									<h3 className="font-semibold text-white text-sm leading-tight line-clamp-2 flex-1 mr-2">
										{thumbnail.projectName}
									</h3>
								</div>
								
								{thumbnail.originalPrompt && (
									<p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
										{thumbnail.originalPrompt}
									</p>
								)}
								
								<div className="pt-2 border-t border-blue-900/30">
									<p className="text-xs text-gray-500 flex items-center">
										<svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										{formatDate(thumbnail.createdAt)}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}