'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const projectTypes = [
	{
		id: 'youtube',
		name: 'YouTube',
		description: 'Create thumbnails for YouTube videos',
		aspectRatio: '16:9',
		icon: '📺',
		gradient: 'from-red-500 to-red-600',
		hoverGradient: 'from-red-400 to-red-500',
	},
	{
		id: 'reels',
		name: 'Reels',
		description: 'Create thumbnails for Instagram/YouTube Reels',
		aspectRatio: '9:16',
		icon: '📱',
		gradient: 'from-purple-500 to-pink-500',
		hoverGradient: 'from-purple-400 to-pink-400',
	},
];

export default function ProjectTypeSelector() {
	const { userId } = useAuth();
	const router = useRouter();
	const [isCreating, setIsCreating] = useState(false);
	const [creatingType, setCreatingType] = useState(null);

	const handleCreateProject = async (projectType) => {
		if (!userId) return;

		setIsCreating(true);
		setCreatingType(projectType.id);

		try {
			const response = await fetch('/api/projects/create', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					type: projectType.id,
					name: `${projectType.name} Project`,
					aspectRatio: projectType.aspectRatio,
				}),
			});

			if (response.ok) {
				const data = await response.json();
				router.push(`/project/${data.projectId}`);
			} else {
				console.error('Failed to create project');
			}
		} catch (error) {
			console.error('Error creating project:', error);
		} finally {
			setIsCreating(false);
			setCreatingType(null);
		}
	};

	return (
		<div className="max-w-4xl mx-auto p-6">
			<div className="text-center mb-8">
				<h1 className="text-3xl font-bold text-white mb-2">
					Choose Your Project Type
				</h1>
				<p className="text-gray-400 text-lg">
					Select the type of thumbnails you want to create
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{projectTypes.map((type) => (
					<div
						key={type.id}
						className="group relative overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:transform hover:scale-105">
						<div
							className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
						/>

						<div className="relative p-8">
							<div className="flex items-center justify-between mb-4">
								<div className="text-4xl">{type.icon}</div>
								<div className="text-sm text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
									{type.aspectRatio}
								</div>
							</div>

							<h3 className="text-2xl font-bold text-white mb-2">
								{type.name}
							</h3>
							<p className="text-gray-400 mb-6">{type.description}</p>

							<button
								onClick={() => handleCreateProject(type)}
								disabled={isCreating}
								className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
									isCreating && creatingType === type.id
										? 'bg-gray-700 text-gray-400 cursor-not-allowed'
										: `bg-gradient-to-r ${type.gradient} hover:${type.hoverGradient} text-white hover:shadow-lg transform hover:translate-y-[-1px]`
								}`}>
								{isCreating && creatingType === type.id ? (
									<div className="flex items-center justify-center space-x-2">
										<div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
										<span>Creating...</span>
									</div>
								) : (
									`Create ${type.name} Project`
								)}
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
