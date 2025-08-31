'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function ProjectList({ showLimit = null, showViewAll = false }) {
	const { userId } = useAuth();
	const router = useRouter();
	const [projects, setProjects] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (userId) {
			fetchProjects();
		}
	}, [userId]);

	const fetchProjects = async () => {
		try {
			const response = await fetch('/api/projects');
			if (response.ok) {
				const data = await response.json();
				setProjects(data.projects || []);
			}
		} catch (error) {
			console.error('Error fetching projects:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	const getProjectIcon = (type) => {
		return type === 'youtube' ? '📺' : '📱';
	};

	const getProjectGradient = (type) => {
		return type === 'youtube'
			? 'from-red-500 to-red-600'
			: 'from-purple-500 to-pink-500';
	};

	const handleDeleteProject = async (e, projectId, projectName) => {
		e.stopPropagation(); // Prevent card click when deleting

		if (
			!window.confirm(
				`Are you sure you want to delete "${projectName}"?\n\nThis will permanently delete:\n• The project\n• All generated thumbnails\n• All images from cloud storage\n\nThis action cannot be undone.`
			)
		) {
			return;
		}

		try {
			const response = await fetch(`/api/projects/${projectId}`, {
				method: 'DELETE',
			});

			if (response.ok) {
				// Remove project from local state
				setProjects((prev) => prev.filter((p) => p._id !== projectId));
				console.log(`Project ${projectId} deleted successfully`);
			} else {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to delete project');
			}
		} catch (error) {
			console.error('Error deleting project:', error);
			alert('Failed to delete project. Please try again.');
		}
	};

	const handleOpenProject = (e, projectId) => {
		e.stopPropagation(); // Prevent any parent click handlers
		router.push(`/project/${projectId}`);
	};

	if (isLoading) {
		return (
			<div className="max-w-4xl mx-auto p-6">
				<div className="flex items-center justify-center py-12">
					<div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
				</div>
			</div>
		);
	}

	if (projects.length === 0) {
		return null;
	}

	return (
		<div className="max-w-4xl mx-auto p-6">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h2 className="text-2xl font-bold text-white mb-2">
						Recent Projects
					</h2>
					<p className="text-gray-400">
						Your recently created and worked on projects
					</p>
				</div>
				{showViewAll && showLimit && projects.length > showLimit && (
					<button
						onClick={() => router.push('/history')}
						className="text-orange-400 hover:text-orange-300 font-medium text-sm flex items-center space-x-1">
						<span>View All</span>
						<svg
							className="w-4 h-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>
				)}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{(showLimit ? projects.slice(0, showLimit) : projects).map(
					(project) => (
						<div
							key={project._id}
							className="group relative bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-all duration-200 hover:transform hover:scale-105">
							{/* Action Icons - Centered */}
							<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 flex items-center space-x-3">
								{/* Open Project Icon */}
								<button
									onClick={(e) => handleOpenProject(e, project._id)}
									className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full transition-all duration-200"
									title="Open project">
									<svg
										className="w-6 h-6"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
										/>
									</svg>
								</button>

								{/* Delete Project Icon */}
								<button
									onClick={(e) =>
										handleDeleteProject(e, project._id, project.name)
									}
									className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-all duration-200"
									title="Delete project">
									<svg
										className="w-6 h-6"
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
								</button>
							</div>

							<div className="flex items-center justify-between mb-3">
								<div className="text-2xl">{getProjectIcon(project.type)}</div>
								<div className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
									{project.aspectRatio}
								</div>
							</div>

							<h3 className="font-semibold text-white mb-1 truncate">
								{project.name}
							</h3>
							<p className="text-sm text-gray-400 capitalize mb-2">
								{project.type} Project
							</p>
							<p className="text-xs text-gray-500">
								Created {formatDate(project.createdAt)}
							</p>

							{project.thumbnailCount > 0 && (
								<div className="mt-3 text-xs text-gray-400">
									{project.thumbnailCount} thumbnail
									{project.thumbnailCount !== 1 ? 's' : ''}
								</div>
							)}

							<div
								className={`absolute inset-0 bg-gradient-to-br ${getProjectGradient(
									project.type
								)} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg`}
							/>
						</div>
					)
				)}
			</div>
		</div>
	);
}
