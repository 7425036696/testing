'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import PromptRefinement from './PromptRefinement';

export default function UploadForm({
	onGenerate,
	isLoading,
	projectType,
	aspectRatio,
	hasGeneratedThumbnails = false,
	lastGeneratedImage = null,
	editingThumbnail = null,
	onCancelEdit = null,
}) {
	const [dragActive, setDragActive] = useState(false);
	const [file, setFile] = useState(null);
	const [prompt, setPrompt] = useState('');
	const [showRefinement, setShowRefinement] = useState(false);
	const [previewUrl, setPreviewUrl] = useState(null);
	const inputRef = useRef(null);

	const handleDrag = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === 'dragenter' || e.type === 'dragover') {
			setDragActive(true);
		} else if (e.type === 'dragleave') {
			setDragActive(false);
		}
	};

	const handleDrop = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);

		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			handleFile(e.dataTransfer.files[0]);
		}
	};

	const handleChange = (e) => {
		e.preventDefault();
		if (e.target.files && e.target.files[0]) {
			handleFile(e.target.files[0]);
		}
	};

	const handleFile = (uploadedFile) => {
		// Clean up previous preview URL
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}

		setFile(uploadedFile);

		// Create preview URL
		if (uploadedFile && uploadedFile.type.startsWith('image/')) {
			const url = URL.createObjectURL(uploadedFile);
			setPreviewUrl(url);
		} else {
			setPreviewUrl(null);
		}
	};

	// Cleanup preview URL on unmount
	useEffect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [previewUrl]);

	// Handle edit mode activation
	useEffect(() => {
		if (editingThumbnail) {
			setPrompt(
				editingThumbnail.originalPrompt || editingThumbnail.prompt || ''
			);
		}
	}, [editingThumbnail]);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (editingThumbnail && prompt) {
			// Edit mode: directly edit without showing refinement
			handleDirectGenerate(e);
		} else if (file && prompt) {
			// Initial generation mode: show refinement
			setShowRefinement(true);
		}
	};

	const handleDirectGenerate = (e) => {
		e.preventDefault();
		if (editingThumbnail && prompt) {
			// Edit mode: use the selected thumbnail for editing
			// We'll need to pass the thumbnail URL as reference
			onGenerate(editingThumbnail, prompt, null, false, true); // true indicates edit mode
		} else if (file && prompt) {
			// Initial generation mode
			onGenerate(file, prompt, null, false); // Direct generation without refinement
		}
	};

	const handleRefinementProceed = (refinementData) => {
		setShowRefinement(false);
		if (editingThumbnail) {
			// Edit mode: use the selected thumbnail
			onGenerate(
				editingThumbnail,
				refinementData.originalPrompt,
				refinementData.refinedPrompt,
				refinementData.useRefinedPrompt,
				true // edit mode
			);
		} else {
			// Initial generation mode
			onGenerate(
				file,
				refinementData.originalPrompt,
				refinementData.refinedPrompt,
				refinementData.useRefinedPrompt
			);
		}
	};

	const handleRefinementCancel = () => {
		setShowRefinement(false);
	};

	const getImageMetadata = () => {
		if (!file) return null;
		return {
			name: file.name,
			type: file.type,
			size: file.size,
		};
	};

	// Convert file to base64
	const getImageData = () => {
		return new Promise((resolve, reject) => {
			if (!file) {
				resolve(null);
				return;
			}

			const reader = new FileReader();
			reader.onload = (e) => {
				resolve(e.target.result);
			};
			reader.onerror = (e) => {
				reject(e);
			};
			reader.readAsDataURL(file);
		});
	};

	return (
		<div className="bg-[#111111] rounded-lg border border-gray-800 p-6">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-semibold text-white">
					{editingThumbnail ? 'Edit Selected Thumbnail' : 'Upload & Generate'}
				</h2>
				{editingThumbnail && onCancelEdit && (
					<button
						type="button"
						onClick={onCancelEdit}
						className="text-gray-400 hover:text-white text-sm">
						Cancel Edit
					</button>
				)}
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Conditional Layout: Upload Box OR Editing Image Preview */}
				{!editingThumbnail ? (
					/* Upload Box and Preview - Side by Side when preview exists */
					<div
						className={`${
							previewUrl ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : ''
						}`}>
						{/* Upload Box */}
						<div
							className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
								dragActive
									? 'border-orange-400 bg-orange-900/20'
									: 'border-gray-600 hover:border-gray-500'
							}`}
							onDragEnter={handleDrag}
							onDragLeave={handleDrag}
							onDragOver={handleDrag}
							onDrop={handleDrop}>
							<input
								ref={inputRef}
								type="file"
								className="hidden"
								accept="image/*"
								onChange={handleChange}
							/>

							{file ? (
								<div className="space-y-2">
									<div className="w-10 h-10 bg-green-900/30 border border-green-700 rounded-lg flex items-center justify-center mx-auto">
										<svg
											className="w-5 h-5 text-green-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
									</div>
									<div className="text-sm font-medium text-white">
										{file.name}
									</div>
									<div className="text-xs text-gray-400">
										{(file.size / 1024 / 1024).toFixed(2)} MB
									</div>
									<button
										type="button"
										onClick={() => inputRef.current.click()}
										className="text-orange-400 hover:text-orange-300 text-sm font-medium">
										Choose different file
									</button>
								</div>
							) : (
								<div className="space-y-2">
									<div className="w-10 h-10 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center mx-auto">
										<svg
											className="w-5 h-5 text-gray-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
											/>
										</svg>
									</div>
									<div className="text-sm text-gray-300">
										Drop your image here, or{' '}
										<button
											type="button"
											onClick={() => inputRef.current.click()}
											className="text-orange-400 hover:text-orange-300 font-medium">
											browse files
										</button>
									</div>
									<div className="text-xs text-gray-500">
										JPG, PNG, GIF • Max 10MB
									</div>
								</div>
							)}
						</div>

						{/* Image Preview */}
						{previewUrl && (
							<div className="space-y-2">
								<label className="block text-sm font-medium text-gray-300">
									Preview
								</label>
								<div className="bg-[#0a0a0a] border border-gray-700 rounded-lg p-4 flex justify-center items-center min-h-[200px]">
									<div className="relative max-w-full max-h-48">
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src={previewUrl}
											alt="Upload preview"
											className="max-w-full max-h-48 rounded-lg object-contain shadow-lg"
										/>
									</div>
								</div>
							</div>
						)}
					</div>
				) : (
					/* Selected Thumbnail Preview for Editing */
					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-300">
							Thumbnail to Edit
						</label>
						<div className="bg-[#0a0a0a] border border-gray-700 rounded-lg p-4 flex justify-center items-center">
							<div className="relative w-full max-w-md">
								<Image
									src={editingThumbnail.url}
									alt="Thumbnail to edit"
									width={400}
									height={300}
									className="w-full h-auto rounded-lg object-contain shadow-lg"
								/>
							</div>
						</div>
						<p className="text-xs text-gray-500 text-center">
							This thumbnail will be used as the base for your edits
						</p>
					</div>
				)}

				{/* Prompt Input */}
				<div>
					<label
						htmlFor="prompt"
						className="block text-sm font-medium text-gray-300 mb-2">
						{editingThumbnail
							? 'Describe changes you want to make'
							: 'Describe your vision'}
					</label>
					<textarea
						id="prompt"
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
						placeholder={
							editingThumbnail
								? 'e.g., change the background to blue, add more dramatic lighting, make text bigger...'
								: 'e.g., modern gaming thumbnail, vibrant neon colors, bold text overlay...'
						}
						className="w-full p-3 bg-[#0a0a0a] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-white placeholder-gray-500"
						rows={3}
					/>
				</div>

				{/* Generate/Edit Buttons */}
				<div className="space-y-3">
					{editingThumbnail ? (
						/* Simple Edit Button - No Enhancement Option */
						<button
							type="button"
							onClick={handleDirectGenerate}
							disabled={!editingThumbnail || !prompt || isLoading}
							className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2">
							{isLoading ? (
								<>
									<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
									<span>Editing Image...</span>
								</>
							) : (
								<>
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
									<span>Edit Image</span>
								</>
							)}
						</button>
					) : (
						/* Generation Buttons with Enhancement Options */
						<>
							{/* Enhanced Generation Button */}
							<button
								type="submit"
								disabled={!file || !prompt || isLoading}
								className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2">
								{isLoading ? (
									<>
										<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
										<span>Generating...</span>
									</>
								) : (
									<>
										<svg
											className="w-4 h-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M13 10V3L4 14h7v7l9-11h-7z"
											/>
										</svg>
										<span>Enhance & Generate</span>
									</>
								)}
							</button>

							{/* Direct Generation Button */}
							<button
								type="button"
								onClick={handleDirectGenerate}
								disabled={!file || !prompt || isLoading}
								className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-500 transition-colors flex items-center justify-center space-x-2 text-sm">
								<svg
									className="w-3 h-3"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 3l14 9-14 9V3z"
									/>
								</svg>
								<span>Skip Enhancement</span>
							</button>
						</>
					)}
				</div>

				{/* Info Section */}
				{!editingThumbnail && (
					<div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3 text-sm mt-4">
						<div className="flex items-start space-x-2">
							<svg
								className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<div className="text-blue-300">
								<strong>Enhance & Generate:</strong> AI will optimize your
								prompt for better thumbnail results (Recommended)
								<br />
								<strong>Skip Enhancement:</strong> Use your original prompt
								directly
							</div>
						</div>
					</div>
				)}
			</form>
			{/* Prompt Refinement Modal */}
			{showRefinement && (
				<PromptRefinement
					originalPrompt={prompt}
					onProceed={handleRefinementProceed}
					onCancel={handleRefinementCancel}
					isRefining={isLoading}
					imageMetadata={getImageMetadata()}
					getImageData={getImageData}
					projectType={projectType}
				/>
			)}
		</div>
	);
}
