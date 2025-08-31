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
		<div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/60 via-blue-950/50 to-slate-900/60 border border-blue-900/40 rounded-2xl p-6 shadow-xl shadow-blue-500/10">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-lg font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
					{editingThumbnail ? 'Edit Selected Thumbnail' : 'Upload & Generate'}
				</h2>
				{editingThumbnail && onCancelEdit && (
					<button
						type="button"
						onClick={onCancelEdit}
						className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white border border-slate-700 hover:border-blue-400/60 hover:bg-slate-800/60 transition-all duration-300 text-sm font-medium">
						Cancel Edit
					</button>
				)}
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Conditional Layout: Upload Box OR Editing Image Preview */}
				{!editingThumbnail ? (
					/* Upload Box and Preview - Side by Side when preview exists */
					<div
						className={`${
							previewUrl ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : ''
						}`}>
						{/* Upload Box */}
						<div
							className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
								dragActive
									? 'border-blue-400 bg-blue-900/30 shadow-lg shadow-blue-500/20'
									: 'border-slate-600 hover:border-blue-400/60 hover:bg-slate-800/30'
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
								<div className="space-y-3">
									<div className="w-12 h-12 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/40 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
										<svg
											className="w-6 h-6 text-emerald-400"
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
									<div className="text-base font-bold text-white">
										{file.name}
									</div>
									<div className="text-sm text-slate-400 font-medium">
										{(file.size / 1024 / 1024).toFixed(2)} MB
									</div>
									<button
										type="button"
										onClick={() => inputRef.current.click()}
										className="text-blue-400 hover:text-cyan-300 font-bold transition-colors duration-300">
										Choose different file
									</button>
								</div>
							) : (
								<div className="space-y-3">
									<div className="w-12 h-12 bg-gradient-to-r from-slate-700/40 to-slate-800/40 border border-slate-600 rounded-xl flex items-center justify-center mx-auto">
										<svg
											className="w-6 h-6 text-slate-400"
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
									<div className="text-base text-slate-200">
										Drop your image here, or{' '}
										<button
											type="button"
											onClick={() => inputRef.current.click()}
											className="text-blue-400 hover:text-cyan-300 font-bold transition-colors duration-300">
											browse files
										</button>
									</div>
									<div className="text-sm text-slate-500 font-medium">
										JPG, PNG, GIF • Max 10MB
									</div>
								</div>
							)}
						</div>

						{/* Image Preview */}
						{previewUrl && (
							<div className="space-y-3">
								<label className="block text-sm font-bold text-slate-300">
									Preview
								</label>
								<div className="backdrop-blur-md bg-slate-900/40 border border-slate-700/60 rounded-xl p-6 flex justify-center items-center min-h-[200px] shadow-lg">
									<div className="relative max-w-full max-h-48">
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src={previewUrl}
											alt="Upload preview"
											className="max-w-full max-h-48 rounded-xl object-contain shadow-xl shadow-blue-500/10 border border-blue-900/20"
										/>
									</div>
								</div>
							</div>
						)}
					</div>
				) : (
					/* Selected Thumbnail Preview for Editing */
					<div className="space-y-3">
						<label className="block text-sm font-bold text-slate-300">
							Thumbnail to Edit
						</label>
						<div className="backdrop-blur-md bg-slate-900/40 border border-slate-700/60 rounded-xl p-6 flex justify-center items-center shadow-lg">
							<div className="relative w-full max-w-md">
								<Image
									src={editingThumbnail.url}
									alt="Thumbnail to edit"
									width={400}
									height={300}
									className="w-full h-auto rounded-xl object-contain shadow-xl shadow-blue-500/10 border border-blue-900/20"
								/>
							</div>
						</div>
						<p className="text-sm text-slate-400 text-center font-medium">
							This thumbnail will be used as the base for your edits
						</p>
					</div>
				)}

				{/* Prompt Input */}
				<div>
					<label
						htmlFor="prompt"
						className="block text-sm font-bold text-slate-300 mb-3">
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
						className="w-full p-4 backdrop-blur-md bg-slate-900/40 border border-slate-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-400/60 resize-none text-white placeholder-slate-500 shadow-lg transition-all duration-300 font-medium"
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
							className="w-full bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 hover:from-orange-500 hover:via-orange-400 hover:to-orange-500 text-white py-3 px-6 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-orange-500/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-400/40 flex items-center justify-center space-x-3">
							{isLoading ? (
								<>
									<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
									<span>Editing Image...</span>
								</>
							) : (
								<>
									<svg
										className="w-5 h-5"
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
								className="w-full bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 hover:from-orange-500 hover:via-orange-400 hover:to-orange-500 text-white py-3 px-6 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-orange-500/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-400/40 flex items-center justify-center space-x-3">
								{isLoading ? (
									<>
										<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
										<span>Generating...</span>
									</>
								) : (
									<>
										<svg
											className="w-5 h-5"
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
								className="w-full px-5 py-2.5 rounded-xl text-base font-bold text-slate-200 border border-slate-700 hover:border-blue-400/60 hover:text-white hover:bg-slate-800/60 bg-slate-900/40 backdrop-blur-md transition-all duration-300 shadow hover:shadow-blue-400/10 focus:outline-none focus:ring-2 focus:ring-blue-400/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
								<svg
									className="w-4 h-4"
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
					<div className="backdrop-blur-md bg-gradient-to-r from-blue-900/30 via-indigo-900/30 to-blue-900/30 border border-blue-700/60 rounded-xl p-4 shadow-lg shadow-blue-500/10 mt-6">
						<div className="flex items-start space-x-3">
							<div className="w-5 h-5 mt-0.5 flex-shrink-0 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/40 flex items-center justify-center">
								<svg
									className="w-3 h-3 text-blue-400"
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
							</div>
							<div className="text-blue-200 font-medium">
								<strong className="text-blue-100">Enhance & Generate:</strong> AI will optimize your
								prompt for better thumbnail results (Recommended)
								<br />
								<strong className="text-blue-100">Skip Enhancement:</strong> Use your original prompt
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