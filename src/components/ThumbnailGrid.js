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
		<div className="bg-[#111111] rounded-lg border border-gray-800 p-6">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h2 className="text-lg font-semibold text-white">
						Generated Thumbnails
					</h2>
					<p className="text-sm text-gray-400">
						{thumbnails.length} variations ready
					</p>
				</div>
				{thumbnails.length > 0 && (
					<button
						data-download-all
						onClick={handleDownloadAll}
						className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center space-x-2">
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
				<div className="text-center py-12 text-gray-500">
					<svg
						className="w-12 h-12 mx-auto mb-4 text-gray-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1}
							d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.414-1.414a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
					<p>No thumbnails generated yet</p>
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
										className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors">
										{/* Image Display - Optimized for 9:16 */}
										<div className="relative w-full aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden mb-4 max-h-80">
											{thumbnail.url ? (
												<Image
													src={thumbnail.url}
													alt={`Reel ${variationNumber}`}
													fill
													className="object-contain rounded-lg"
													sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
												/>
											) : (
												<div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
													Preview {variationNumber}
												</div>
											)}
										</div>

										{/* Thumbnail Info */}
										<div className="mb-3">
											<h3 className="text-sm font-medium text-gray-200">
												Variation {variationNumber}
											</h3>
											<p className="text-xs text-gray-500 mt-1">
												{new Date(
													thumbnail.createdAt || Date.now()
												).toLocaleTimeString()}
											</p>
										</div>

										{/* Actions - Stacked for reel layout */}
										<div className="space-y-2">
											{/* Download Button */}
											<button
												onClick={() => handleDownload(thumbnail)}
												className="w-full bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors text-sm">
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
											<div className="flex space-x-2">
												<button
													onClick={() => handleEdit(thumbnail)}
													className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg font-medium flex items-center justify-center transition-colors text-sm"
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
													className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg font-medium flex items-center justify-center transition-colors text-sm"
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
										className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
										{/* Image Display - Standard for YouTube */}
										<div className="relative w-full h-64 bg-gray-900 rounded-lg overflow-hidden mb-4">
											{thumbnail.url ? (
												<Image
													src={thumbnail.url}
													alt={`Thumbnail ${variationNumber}`}
													fill
													className="object-contain rounded-lg"
													sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
												/>
											) : (
												<div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
													Preview {variationNumber}
												</div>
											)}
										</div>
										{/* Thumbnail Info and Actions */}
										<div className="flex items-center justify-between">
											<div>
												<h3 className="text-base font-medium text-gray-200">
													Variation {variationNumber}
												</h3>
												<p className="text-sm text-gray-500 mt-1">
													Generated at{' '}
													{new Date(
														thumbnail.createdAt || Date.now()
													).toLocaleTimeString()}
												</p>
											</div>
											<div className="flex items-center space-x-2">
												{/* Download Button */}
												<button
													onClick={() => handleDownload(thumbnail)}
													className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded-lg font-medium flex items-center space-x-2 transition-colors">
													<span>Download</span>
												</button>
												{/* Edit Button */}
												<button
													onClick={() => handleEdit(thumbnail)}
													className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg font-medium flex items-center justify-center transition-colors"
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
													className="bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg font-medium flex items-center justify-center transition-colors"
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
