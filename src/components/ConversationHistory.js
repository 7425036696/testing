'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

export default function ConversationHistory({ 
	projectId, 
	isVisible = false, 
	onClose,
	onResetConversation 
}) {
	const [conversation, setConversation] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const fetchConversation = useCallback(async () => {
		setLoading(true);
		setError('');
		
		try {
			const response = await fetch(`/api/conversation?projectId=${projectId}`);
			const data = await response.json();
			
			if (data.success) {
				setConversation(data.conversation);
			} else {
				setError(data.error || 'Failed to fetch conversation');
			}
		} catch (err) {
			setError('Network error fetching conversation');
			console.error('Error fetching conversation:', err);
		} finally {
			setLoading(false);
		}
	}, [projectId]);

	useEffect(() => {
		if (isVisible && projectId) {
			fetchConversation();
		}
	}, [isVisible, projectId, fetchConversation]);

	const handleResetConversation = async () => {
		if (!confirm('Are you sure you want to reset the conversation history? This will start a fresh editing session.')) {
			return;
		}

		try {
			setLoading(true);
			const response = await fetch('/api/conversation', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					projectId: projectId,
					action: 'reset'
				}),
			});

			const data = await response.json();
			
			if (data.success) {
				setConversation(null);
				onResetConversation?.();
				alert('Conversation reset successfully! Your next edit will start a fresh session.');
			} else {
				setError(data.error || 'Failed to reset conversation');
			}
		} catch (err) {
			setError('Network error resetting conversation');
			console.error('Error resetting conversation:', err);
		} finally {
			setLoading(false);
		}
	};

	if (!isVisible) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
			<div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
				{/* Header */}
				<div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex justify-between items-center">
					<div>
						<h2 className="text-xl font-bold">Conversation History</h2>
						{conversation && (
							<p className="text-sm opacity-90">
								{conversation.totalSteps} interactions • {conversation.totalTokens} tokens used
							</p>
						)}
					</div>
					<div className="flex space-x-2">
						{conversation && (
							<button
								onClick={handleResetConversation}
								disabled={loading}
								className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-sm disabled:opacity-50 transition-colors"
							>
								Reset History
							</button>
						)}
						<button
							onClick={onClose}
							className="text-white hover:text-gray-200 text-2xl font-bold transition-colors"
						>
							×
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)] bg-gray-900">
					{loading ? (
						<div className="flex items-center justify-center py-12">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
							<span className="ml-3 text-gray-300">Loading conversation...</span>
						</div>
					) : error ? (
						<div className="text-red-400 bg-red-900 bg-opacity-50 border border-red-800 p-4 rounded-lg">
							<p className="font-medium">Error:</p>
							<p>{error}</p>
							<button 
								onClick={fetchConversation}
								className="mt-2 text-red-400 underline hover:text-red-300 transition-colors"
							>
								Try Again
							</button>
						</div>
					) : !conversation ? (
						<div className="text-center py-12 text-gray-400">
							<div className="mb-4">
								<svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.964L3 20l1.036-5.874A8.955 8.955 0 013 12a8 8 0 1118 0z" />
								</svg>
							</div>
							<h3 className="text-lg font-medium text-gray-200 mb-2">No Conversation History</h3>
							<p className="text-gray-400">Start editing thumbnails to build conversation history.</p>
						</div>
					) : (
						<div className="space-y-4">
							{/* Summary */}
							{conversation.summary && (
								<div className="bg-blue-900 bg-opacity-50 border-l-4 border-blue-500 p-4 rounded">
									<h4 className="font-medium text-blue-300 mb-2">Earlier in this session:</h4>
									<p className="text-blue-200 text-sm whitespace-pre-line">{conversation.summary}</p>
								</div>
							)}

							{/* Conversation History */}
							{conversation.history && conversation.history.length > 0 ? (
								<div className="space-y-4">
									<h4 className="font-medium text-gray-200 border-b border-gray-700 pb-2">Recent Interactions</h4>
									{conversation.history.map((interaction, index) => (
										<div 
											key={index}
											className={`flex ${interaction.role === 'user' ? 'justify-end' : 'justify-start'}`}
										>
											<div className={`max-w-3xl rounded-lg p-4 border ${
												interaction.role === 'user' 
													? 'bg-purple-900 bg-opacity-50 border-purple-700 text-purple-100' 
													: 'bg-gray-800 border-gray-700 text-gray-200'
											}`}>
												<div className="flex items-start space-x-3">
													<div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
														interaction.role === 'user' 
															? 'bg-purple-600 text-purple-100' 
															: 'bg-gray-600 text-gray-200'
													}`}>
														{interaction.role === 'user' ? 'U' : 'AI'}
													</div>
													<div className="flex-1">
														<div className="flex items-start justify-between mb-1">
															<span className={`text-xs font-medium ${
																interaction.role === 'user' 
																	? 'text-purple-300' 
																	: 'text-gray-400'
															}`}>
																{interaction.role === 'user' ? 'Your Request' : 'AI Response'}
															</span>
															{interaction.timestamp && (
																<span className="text-xs opacity-70 text-gray-400">
																	{new Date(interaction.timestamp).toLocaleString()}
																</span>
															)}
														</div>
														<p className="text-sm whitespace-pre-wrap">{interaction.content}</p>
														{interaction.imageId && (
															<div className="mt-2">
																<span className="text-xs bg-gray-700 bg-opacity-50 px-2 py-1 rounded text-gray-300">
																	🎨 Image #{index + 1} generated
																</span>
															</div>
														)}
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-8 text-gray-400">
									<p>No recent interactions to display.</p>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
