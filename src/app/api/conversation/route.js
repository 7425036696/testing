import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/mongo';
import Conversation from '@/models/Conversation';
import Image from '@/models/Image';

/**
 * GET: Get conversation history for a project
 * POST: Reset/Archive conversation for a project
 * PUT: Update conversation settings
 */

export async function GET(request) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const projectId = searchParams.get('projectId');

		if (!projectId) {
			return NextResponse.json(
				{ error: 'Project ID is required' },
				{ status: 400 }
			);
		}

		await connectDB();
		
		const conversation = await Conversation.findOne({
			projectId,
			userId,
			status: 'active'
		}).populate('history.imageId', 'cloudinaryUrl filename createdAt');

		if (!conversation) {
			return NextResponse.json({
				success: true,
				conversation: null,
				message: 'No active conversation found'
			});
		}

		// Get optimized context for display
		const contextHistory = conversation.getContextForAPI(8000); // More tokens for display

		return NextResponse.json({
			success: true,
			conversation: {
				id: conversation._id,
				projectId: conversation.projectId,
				totalSteps: conversation.history.length,
				totalTokens: conversation.totalTokensUsed,
				lastInteraction: conversation.lastInteractionAt,
				status: conversation.status,
				summary: conversation.summary,
				history: contextHistory,
				currentImageId: conversation.currentImageId,
			}
		});

	} catch (error) {
		console.error('Error fetching conversation:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch conversation' },
			{ status: 500 }
		);
	}
}

export async function POST(request) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { projectId, action = 'reset' } = body;

		if (!projectId) {
			return NextResponse.json(
				{ error: 'Project ID is required' },
				{ status: 400 }
			);
		}

		await connectDB();

		if (action === 'reset') {
			// Archive current conversation and start fresh
			await Conversation.updateOne(
				{ projectId, userId, status: 'active' },
				{ 
					status: 'archived',
					archivedAt: new Date()
				}
			);

			return NextResponse.json({
				success: true,
				message: 'Conversation reset successfully'
			});
		}

		if (action === 'archive') {
			// Just archive without creating new
			const result = await Conversation.updateOne(
				{ projectId, userId, status: 'active' },
				{ 
					status: 'archived',
					archivedAt: new Date()
				}
			);

			return NextResponse.json({
				success: true,
				message: 'Conversation archived successfully',
				modified: result.modifiedCount
			});
		}

		return NextResponse.json(
			{ error: 'Invalid action. Use "reset" or "archive"' },
			{ status: 400 }
		);

	} catch (error) {
		console.error('Error managing conversation:', error);
		return NextResponse.json(
			{ error: 'Failed to manage conversation' },
			{ status: 500 }
		);
	}
}

export async function PUT(request) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { projectId, maxContextLength, settings = {} } = body;

		if (!projectId) {
			return NextResponse.json(
				{ error: 'Project ID is required' },
				{ status: 400 }
			);
		}

		await connectDB();

		const updateData = {};
		if (maxContextLength && maxContextLength > 0 && maxContextLength <= 50) {
			updateData.maxContextLength = maxContextLength;
		}

		const conversation = await Conversation.findOneAndUpdate(
			{ projectId, userId, status: 'active' },
			updateData,
			{ new: true }
		);

		if (!conversation) {
			return NextResponse.json(
				{ error: 'Active conversation not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			message: 'Conversation settings updated',
			conversation: {
				id: conversation._id,
				maxContextLength: conversation.maxContextLength,
				totalSteps: conversation.history.length
			}
		});

	} catch (error) {
		console.error('Error updating conversation settings:', error);
		return NextResponse.json(
			{ error: 'Failed to update conversation settings' },
			{ status: 500 }
		);
	}
}
