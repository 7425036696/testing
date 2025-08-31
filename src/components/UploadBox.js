'use client';

import { useState, useRef } from 'react';

export default function UploadBox({ onFileUpload }) {
	const [dragActive, setDragActive] = useState(false);
	const [file, setFile] = useState(null);
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

	const handleFile = (file) => {
		setFile(file);
		onFileUpload(file);
	};

	const onButtonClick = () => {
		inputRef.current.click();
	};

	return (
		<div
			className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
				dragActive
					? 'border-orange-400 bg-orange-500/5 scale-[1.02]'
					: 'border-gray-600 hover:border-gray-500 hover:bg-gray-900/30'
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

			<div className="space-y-6">
				{file ? (
					<div className="space-y-4">
						<div className="flex items-center justify-center">
							<div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4">
								<svg
									className="w-8 h-8 text-white"
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
						</div>
						<div className="text-xl font-semibold text-green-400">
							Perfect! File uploaded successfully
						</div>
						<div className="glass-effect p-4 rounded-xl border border-gray-700 max-w-md mx-auto">
							<div className="text-white font-medium truncate">{file.name}</div>
							<div className="text-sm text-gray-400 mt-1">
								{(file.size / 1024 / 1024).toFixed(2)} MB
							</div>
						</div>
						<button
							onClick={onButtonClick}
							className="text-orange-400 hover:text-orange-300 underline hover:no-underline transition-colors duration-200 font-medium">
							Choose different file
						</button>
					</div>
				) : (
					<div className="space-y-6">
						<div className="flex items-center justify-center">
							<div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl flex items-center justify-center mb-4 hover-lift">
								<svg
									className="w-10 h-10 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1.5}
										d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
									/>
								</svg>
							</div>
						</div>
						<div>
							<div className="text-xl font-semibold text-white mb-3">
								Drop your image here, or{' '}
								<button
									onClick={onButtonClick}
									className="text-orange-400 hover:text-orange-300 underline hover:no-underline transition-colors duration-200">
									browse files
								</button>
							</div>
							<div className="text-sm text-gray-400 space-y-1">
								<div>Supports: JPG, PNG, GIF</div>
								<div>Maximum size: 10MB</div>
							</div>
						</div>
					</div>
				)}
			</div>

			{dragActive && (
				<div className="absolute inset-0 bg-orange-500/10 rounded-2xl border-2 border-orange-400 flex items-center justify-center">
					<div className="text-xl font-semibold text-orange-300">
						Drop it here! ✨
					</div>
				</div>
			)}
		</div>
	);
}
