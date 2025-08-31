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
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div className="bg-[#111111] rounded-lg border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
				<div className="p-6">
					{/* Header */}
					<div className="flex items-center justify-between mb-6">
						<div>
							<h2 className="text-xl font-bold text-white mb-2">
								Enhance Your Prompt
							</h2>
							<p className="text-gray-400 text-sm">
								Let AI optimize your prompt for better thumbnail generation
							</p>
						</div>
						<button
							onClick={onCancel}
							className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors">
							<svg
								className="w-5 h-5"
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
					<div className="mb-6">
						<label className="block text-sm font-medium text-gray-300 mb-2">
							Your Original Prompt
						</label>
						<div className="bg-[#0a0a0a] rounded-lg border border-gray-700 p-3 text-gray-300">
							{originalPrompt}
						</div>
					</div>

					{/* Refine Button */}
					{!hasRefined && (
						<div className="mb-6">
							<button
								onClick={handleRefinePrompt}
								disabled={isLoading || isRefining}
								className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2">
								{isLoading ? (
									<>
										<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
										<span>Enhancing Prompt...</span>
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
										<span>Enhance with AI</span>
									</>
								)}
							</button>
						</div>
					)}

					{/* Error Display */}
					{error && (
						<div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-lg text-red-300 text-sm">
							{error}
						</div>
					)}

					{/* Refined Prompt */}
					{hasRefined && refinedPrompt && (
						<div className="mb-6">
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Enhanced Prompt
								<span className="ml-2 text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">
									AI Enhanced
								</span>
							</label>
							<div className="bg-[#0a0a0a] rounded-lg border border-gray-700 p-3 text-gray-300">
								{refinedPrompt}
							</div>

							{/* Prompt Selection */}
							<div className="mt-4 space-y-2">
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Choose which prompt to use:
								</label>

								<label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-700 hover:border-gray-600 cursor-pointer transition-colors">
									<input
										type="radio"
										name="promptChoice"
										value="refined"
										checked={selectedPrompt === 'refined'}
										onChange={(e) => setSelectedPrompt(e.target.value)}
										className="text-orange-500 bg-[#0a0a0a] border-gray-600 focus:ring-orange-500"
									/>
									<div className="flex-1">
										<div className="text-white font-medium">
											Use Enhanced Prompt
										</div>
										<div className="text-gray-400 text-sm">
											Optimized for better thumbnail generation
										</div>
									</div>
									<span className="text-green-400 text-sm">Recommended</span>
								</label>

								<label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-700 hover:border-gray-600 cursor-pointer transition-colors">
									<input
										type="radio"
										name="promptChoice"
										value="original"
										checked={selectedPrompt === 'original'}
										onChange={(e) => setSelectedPrompt(e.target.value)}
										className="text-orange-500 bg-[#0a0a0a] border-gray-600 focus:ring-orange-500"
									/>
									<div className="flex-1">
										<div className="text-white font-medium">
											Use Original Prompt
										</div>
										<div className="text-gray-400 text-sm">
											Keep your original prompt unchanged
										</div>
									</div>
								</label>
							</div>
						</div>
					)}

					{/* Action Buttons */}
					<div className="flex space-x-3">
						<button
							onClick={onCancel}
							className="flex-1 bg-gray-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors">
							Cancel
						</button>

						{hasRefined ? (
							<button
								onClick={handleProceed}
								disabled={isRefining}
								className="flex-1 bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
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
								className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
								Skip & Generate
							</button>
						)}
					</div>

					{/* Pro Tip */}
					<div className="mt-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg text-blue-300 text-sm">
						<div className="flex items-start space-x-2">
							<svg
								className="w-4 h-4 mt-0.5 flex-shrink-0"
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
							<div>
								<strong>Pro Tip:</strong> Enhanced prompts typically generate
								more visually appealing and thumbnail-optimized results by
								adding specific details about colors, composition, and visual
								elements.
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
