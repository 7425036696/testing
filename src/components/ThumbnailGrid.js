'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ThumbnailGrid({
	thumbnails,
	onDownloadAll, // Optional - we handle internally if not provided
	isLoading,
	projectType,
	onDeleteThumbnail,
	projectId, // Add projectId prop
	onEditThumbnail, // Add edit handler prop
}) {
	const [deletingThumbnails, setDeletingThumbnails] = useState(new Set());
	const handleDownload = async (thumbnail) => {
		try {
			// Fetch the image as a blob to force download
			const response = await fetch(thumbnail.url || thumbnail.cloudinaryUrl);
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
			const variationNumber = thumbnails.length - thumbnails.indexOf(thumbnail);
			link.download = `thumbnail-variation-${variationNumber}-${timestamp}.png`;

			// Trigger download
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			// Clean up the object URL
			URL.revokeObjectURL(url);

			console.log('Downloaded thumbnail:', thumbnail.id);
		} catch (error) {
			console.error('Failed to download thumbnail:', error);
			alert('Failed to download thumbnail. Please try again.');
		}
	};

	const handleEdit = (thumbnail) => {
		console.log('Edit thumbnail:', thumbnail.id);
		if (onEditThumbnail) {
			onEditThumbnail(thumbnail);
		}
	};

	const handleDelete = async (thumbnail) => {
		if (
			window.confirm(
				`Are you sure you want to delete Variation ${
					thumbnails.length - thumbnails.indexOf(thumbnail)
				}? This action cannot be undone.`
			)
		) {
			// Add thumbnail to deleting set
			setDeletingThumbnails((prev) => new Set(prev).add(thumbnail.id));

			try {
				await onDeleteThumbnail(thumbnail.id);
			} catch (error) {
				console.error('Failed to delete thumbnail:', error);
				alert('Failed to delete thumbnail. Please try again.');
			} finally {
				// Remove thumbnail from deleting set
				setDeletingThumbnails((prev) => {
					const newSet = new Set(prev);
					newSet.delete(thumbnail.id);
					return newSet;
				});
			}
		}
	};

	const handleDownloadAll = async () => {
		try {
			console.log('Starting ZIP download for project:', projectId);

			// Show loading state
			const downloadButton = document.querySelector('[data-download-all]');
			if (downloadButton) {
				downloadButton.disabled = true;
				downloadButton.innerHTML = `
					<div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
					<span>Creating ZIP...</span>
				`;
			}

			// Create request payload
			const payload = projectId
				? { projectId }
				: { thumbnailIds: thumbnails.map((t) => t.dbId || t.id) };

			// Make API call to create ZIP
			const response = await fetch('/api/download-zip', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to create ZIP file');
			}

			// Get the ZIP file as blob
			const blob = await response.blob();

			// Extract filename from response headers
			const contentDisposition = response.headers.get('Content-Disposition');
			const filename = contentDisposition
				? contentDisposition.split('filename=')[1].replace(/"/g, '')
				: `thumbnails_${Date.now()}.zip`;

			// Create download link
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = filename;

			// Trigger download
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			// Clean up
			window.URL.revokeObjectURL(url);

			console.log('ZIP download completed:', filename);
		} catch (error) {
			console.error('Failed to download ZIP:', error);
			alert('Failed to download ZIP file. Please try again.');
		} finally {
			// Reset button state
			const downloadButton = document.querySelector('[data-download-all]');
			if (downloadButton) {
				downloadButton.disabled = false;
				downloadButton.innerHTML = `
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
					</svg>
					<span>Download All as ZIP</span>
				`;
			}
		}
	};

	return (
		<div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/60 via-blue-950/50 to-slate-900/60 border border-blue-900/40 rounded-2xl p-6 shadow-xl shadow-blue-500/10">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h2 className="text-lg font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
						Generated Thumbnails
					</h2>
					<p className="text-sm text-slate-400 font-medium">
						{thumbnails.length} variations ready
					</p>
				</div>
				{thumbnails.length > 0 && (
					<button
						data-download-all
						onClick={handleDownloadAll}
						className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 hover:from-orange-500 hover:via-orange-400 hover:to-orange-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-orange-500/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-400/40 flex items-center space-x-2">
						<svg
							className="w-4 h-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"
							/>
						</svg>
						<span>Download All as ZIP</span>
					</button>
				)}
			</div>

			{thumbnails.length === 0 ? (
				<div className="text-center py-16">
					<div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-slate-700/40 to-slate-800/40 border border-slate-600 flex items-center justify-center">
						<svg
							className="w-8 h-8 text-slate-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
								d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.414-1.414a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
					</div>
					<p className="text-slate-400 font-medium">No thumbnails generated yet</p>
				</div>
			) : (
				<>
					{/* Thumbnails Layout - Horizontal for Reels, Vertical for others */}
					{projectType === 'reels' ? (
						/* Horizontal Layout for Reels (9:16) */
						<div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
							{thumbnails.map((thumbnail, index) => {
								// Calculate variation number based on creation order (latest has highest number)
								const variationNumber = thumbnails.length - index;

								return (
									<div
										key={thumbnail.id}
										className="backdrop-blur-md bg-slate-900/40 border border-slate-700/60 rounded-xl p-5 hover:border-blue-400/60 hover:bg-slate-800/40 transition-all duration-300 shadow-lg shadow-blue-500/5">
										{/* Image Display - Optimized for 9:16 */}
										<div className="relative w-full aspect-[9/16] bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-xl overflow-hidden mb-4 max-h-80 border border-slate-700/40">
											{thumbnail.url ? (
												<Image
													src={thumbnail.url}
													alt={`Reel ${variationNumber}`}
													fill
													className="object-contain rounded-xl"
													sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
												/>
											) : (
												<div className="absolute inset-0 flex items-center justify-center text-slate-400 font-medium">
													Preview {variationNumber}
												</div>
											)}
										</div>

										{/* Thumbnail Info */}
										<div className="mb-4">
											<h3 className="text-sm font-bold text-white">
												Variation {variationNumber}
											</h3>
											<p className="text-xs text-slate-400 mt-1 font-medium">
												{new Date(
													thumbnail.createdAt || Date.now()
												).toLocaleTimeString()}
											</p>
										</div>

										{/* Actions - Stacked for reel layout */}
										<div className="space-y-3">
											{/* Download Button */}
											<button
												onClick={() => handleDownload(thumbnail)}
												className="w-full bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 hover:from-orange-500 hover:via-orange-400 hover:to-orange-500 text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-orange-500/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-400/40">
												<svg
													className="w-4 h-4"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24">
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.414-1.414a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
													/>
												</svg>
												<span>Download</span>
											</button>

											{/* Edit and Delete Buttons - Side by side */}
											<div className="flex space-x-3">
												<button
													onClick={() => handleEdit(thumbnail)}
													className="flex-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:via-cyan-400 hover:to-blue-500 text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-blue-500/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
													title="Edit this reel">
													<svg
														className="w-4 h-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24">
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
														/>
													</svg>
												</button>
												<button
													onClick={() => handleDelete(thumbnail)}
													disabled={deletingThumbnails.has(thumbnail.id)}
													className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-red-500/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400/40"
													title="Delete reel">
													{deletingThumbnails.has(thumbnail.id) ? (
														<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
													) : (
														<svg
															className="w-4 h-4"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24">
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
															/>
														</svg>
													)}
												</button>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					) : (
						/* Vertical Layout for YouTube and other formats */
						<div className="space-y-6 mb-6">
							{thumbnails.map((thumbnail, index) => {
								// Calculate variation number based on creation order (latest has highest number)
								const variationNumber = thumbnails.length - index;

								return (
									<div
										key={thumbnail.id}
										className="backdrop-blur-md bg-slate-900/40 border border-slate-700/60 rounded-xl p-6 hover:border-blue-400/60 hover:bg-slate-800/40 transition-all duration-300 shadow-lg shadow-blue-500/5">
										{/* Image Display - Standard for YouTube */}
										<div className="relative w-full h-64 bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-xl overflow-hidden mb-5 border border-slate-700/40">
											{thumbnail.url ? (
												<Image
													src={thumbnail.url}
													alt={`Thumbnail ${variationNumber}`}
													fill
													className="object-contain rounded-xl"
													sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
												/>
											) : (
												<div className="absolute inset-0 flex items-center justify-center text-slate-400 font-medium">
													Preview {variationNumber}
												</div>
											)}
										</div>
										{/* Thumbnail Info and Actions */}
										<div className="flex items-center justify-between">
											<div>
												<h3 className="text-base font-bold text-white">
													Variation {variationNumber}
												</h3>
												<p className="text-sm text-slate-400 mt-1 font-medium">
													Generated at{' '}
													{new Date(
														thumbnail.createdAt || Date.now()
													).toLocaleTimeString()}
												</p>
											</div>
											<div className="flex items-center space-x-3">
												{/* Download Button */}
												<button
													onClick={() => handleDownload(thumbnail)}
													className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 hover:from-orange-500 hover:via-orange-400 hover:to-orange-500 text-white px-5 py-2 rounded-xl font-bold flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-orange-500/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-400/40">
													<span>Download</span>
												</button>
												{/* Edit Button */}
												<button
													onClick={() => handleEdit(thumbnail)}
													className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:via-cyan-400 hover:to-blue-500 text-white px-3 py-2 rounded-xl font-bold flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-blue-500/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
													title="Edit this thumbnail">
													<svg
														className="w-4 h-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24">
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
														/>
													</svg>
												</button>
												{/* Delete Button */}
												<button
													onClick={() => handleDelete(thumbnail)}
													disabled={deletingThumbnails.has(thumbnail.id)}
													className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-xl font-bold flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-red-500/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400/40"
													title="Delete thumbnail">
													{deletingThumbnails.has(thumbnail.id) ? (
														<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
													) : (
														<svg
															className="w-4 h-4"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24">
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
															/>
														</svg>
													)}
												</button>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</>
			)}
		</div>
	);
}