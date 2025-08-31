'use client';

import { useState } from 'react';

export default function PromptRefinement({
	originalPrompt,
	onProceed,
	onCancel,
	isRefining,
	imageMetadata,
	getImageData,
	projectType,
}) {
	const [refinedPrompt, setRefinedPrompt] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [hasRefined, setHasRefined] = useState(false);
	const [selectedPrompt, setSelectedPrompt] = useState('refined'); // 'original' or 'refined'

	const handleRefinePrompt = async () => {
		if (!originalPrompt.trim()) {
			setError('Please provide a prompt to refine');
			return;
		}

		setIsLoading(true);
		setError('');

		try {
			// Get image data if available
			let imageData = null;
			if (getImageData) {
				try {
					imageData = await getImageData();
				} catch (err) {
					console.warn('Could not read image data:', err);
					// Continue without image data
				}
			}

			const response = await fetch('/api/enhance-prompt', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					originalPrompt: originalPrompt.trim(),
					imageMetadata,
					imageData,
					projectType,
				}),
			});

			const data = await response.json();

			if (data.success) {
				setRefinedPrompt(data.refinedPrompt);
				setHasRefined(true);

				// Auto-select refined prompt if it's different from original
				if (data.refinedPrompt !== originalPrompt) {
					setSelectedPrompt('refined');
				}
			} else {
				throw new Error(data.error || 'Failed to refine prompt');
			}
		} catch (err) {
			setError(err.message || 'Failed to refine prompt');
			console.error('Prompt refinement error:', err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleProceed = () => {
		const promptToUse =
			selectedPrompt === 'refined' && refinedPrompt
				? refinedPrompt
				: originalPrompt;
		onProceed({
			originalPrompt,
			refinedPrompt: hasRefined ? refinedPrompt : null,
			selectedPrompt: promptToUse,
			useRefinedPrompt: selectedPrompt === 'refined' && hasRefined,
		});
	};

	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
			<div className="backdrop-blur-xl bg-gradient-to-br from-slate-950/90 via-blue-950/80 to-slate-900/90 rounded-2xl border border-blue-900/40 shadow-2xl shadow-blue-900/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
				<div className="p-8">
					{/* Header */}
					<div className="flex items-center justify-between mb-8">
						<div>
							<h2 className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent mb-3 tracking-tight">
								Enhance Your Prompt
							</h2>
							<p className="text-slate-400 text-base">
								Let AI optimize your prompt for better thumbnail generation
							</p>
						</div>
						<button
							onClick={onCancel}
							className="text-slate-400 hover:text-white p-3 rounded-xl hover:bg-slate-800/60 transition-all duration-300 group border border-slate-700 hover:border-blue-400/40">
							<svg
								className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>

					{/* Original Prompt */}
					<div className="mb-8">
						<label className="block text-base font-bold text-slate-200 mb-3">
							Your Original Prompt
						</label>
						<div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-slate-700 p-4 text-slate-200 shadow-inner">
							{originalPrompt}
						</div>
					</div>

					{/* Refine Button */}
					{!hasRefined && (
						<div className="mb-8">
							<button
								onClick={handleRefinePrompt}
								disabled={isLoading || isRefining}
								className="w-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:via-cyan-400 hover:to-blue-500 text-white py-4 px-6 rounded-xl font-bold hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/40">
								{isLoading ? (
									<>
										<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
										<span className="text-lg">Enhancing Prompt...</span>
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
										<span className="text-lg">Enhance with AI</span>
									</>
								)}
							</button>
						</div>
					)}

					{/* Error Display */}
					{error && (
						<div className="mb-6 p-4 bg-red-900/30 backdrop-blur-md border border-red-700/50 rounded-xl text-red-300 text-base shadow-lg">
							<div className="flex items-start space-x-3">
								<svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								{error}
							</div>
						</div>
					)}

					{/* Refined Prompt */}
					{hasRefined && refinedPrompt && (
						<div className="mb-8">
							<label className="block text-base font-bold text-slate-200 mb-3 flex items-center gap-3">
								Enhanced Prompt
								<span className="text-xs bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 px-3 py-1.5 rounded-full border border-cyan-400/30 font-bold tracking-wide">
									AI ENHANCED
								</span>
							</label>
							<div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-slate-700 p-4 text-slate-200 shadow-inner">
								{refinedPrompt}
							</div>

							{/* Prompt Selection */}
							<div className="mt-6 space-y-3">
								<label className="block text-base font-bold text-slate-200 mb-4">
									Choose which prompt to use:
								</label>

								<label className="flex items-center space-x-4 p-4 rounded-xl border border-slate-700 hover:border-blue-400/60 cursor-pointer transition-all duration-300 bg-slate-900/40 backdrop-blur-md hover:bg-slate-800/60 group">
									<input
										type="radio"
										name="promptChoice"
										value="refined"
										checked={selectedPrompt === 'refined'}
										onChange={(e) => setSelectedPrompt(e.target.value)}
										className="w-5 h-5 text-cyan-500 bg-slate-900 border-slate-600 focus:ring-cyan-400/40 focus:ring-2"
									/>
									<div className="flex-1">
										<div className="text-white font-bold text-lg group-hover:text-cyan-200 transition-colors duration-200">
											Use Enhanced Prompt
										</div>
										<div className="text-slate-400 text-base mt-1">
											Optimized for better thumbnail generation
										</div>
									</div>
									<span className="bg-gradient-to-r from-green-500 to-emerald-400 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
										Recommended
									</span>
								</label>

								<label className="flex items-center space-x-4 p-4 rounded-xl border border-slate-700 hover:border-blue-400/60 cursor-pointer transition-all duration-300 bg-slate-900/40 backdrop-blur-md hover:bg-slate-800/60 group">
									<input
										type="radio"
										name="promptChoice"
										value="original"
										checked={selectedPrompt === 'original'}
										onChange={(e) => setSelectedPrompt(e.target.value)}
										className="w-5 h-5 text-cyan-500 bg-slate-900 border-slate-600 focus:ring-cyan-400/40 focus:ring-2"
									/>
									<div className="flex-1">
										<div className="text-white font-bold text-lg group-hover:text-cyan-200 transition-colors duration-200">
											Use Original Prompt
										</div>
										<div className="text-slate-400 text-base mt-1">
											Keep your original prompt unchanged
										</div>
									</div>
								</label>
							</div>
						</div>
					)}

					{/* Action Buttons */}
					<div className="flex space-x-4 mb-6">
						<button
							onClick={onCancel}
							className="flex-1 bg-slate-800/60 backdrop-blur-md text-slate-200 py-4 px-6 rounded-xl font-bold hover:bg-slate-700/60 hover:text-white border border-slate-700 hover:border-slate-600 transition-all duration-300 text-lg">
							Cancel
						</button>

						{hasRefined ? (
							<button
								onClick={handleProceed}
								disabled={isRefining}
								className="flex-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:via-cyan-400 hover:to-blue-500 text-white py-4 px-6 rounded-xl font-bold hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 shadow-lg hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 text-lg">
								Generate Thumbnails
							</button>
						) : (
							<button
								onClick={() =>
									onProceed({
										originalPrompt,
										selectedPrompt: originalPrompt,
										useRefinedPrompt: false,
									})
								}
								disabled={isRefining}
								className="flex-1 bg-slate-700/60 backdrop-blur-md text-slate-200 py-4 px-6 rounded-xl font-bold hover:bg-slate-600/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600 hover:border-slate-500 transition-all duration-300 text-lg">
								Skip & Generate
							</button>
						)}
					</div>

					{/* Pro Tip */}
					<div className="p-5 bg-gradient-to-r from-blue-900/30 via-cyan-900/20 to-blue-900/30 backdrop-blur-md border border-blue-700/50 rounded-xl text-blue-200 text-base shadow-lg">
						<div className="flex items-start space-x-3">
							<div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
								<svg
									className="w-4 h-4 text-white"
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
							<div>
								<strong className="font-bold text-cyan-300">Pro Tip:</strong>{' '}
								<span className="text-blue-100">
									Enhanced prompts typically generate more visually appealing and 
									thumbnail-optimized results by adding specific details about colors, 
									composition, and visual elements.
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}