import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongo';
import Image from '@/models/Image';
import Project from '@/models/Project';

export async function GET(request) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		await connectDB();

		// Aggregate thumbnails with project information
		const thumbnails = await Image.aggregate([
			{
				// Match images for this user
				$lookup: {
					from: 'projects',
					localField: 'projectId',
					foreignField: '_id',
					as: 'project'
				}
			},
			{
				// Filter by user
				$match: {
					'project.userId': userId
				}
			},
			{
				// Unwind the project array
				$unwind: '$project'
			},
			{
				// Project the fields we need
				$project: {
					_id: 1,
					url: '$cloudinaryUrl',
					cloudinaryId: 1,
					prompt: 1,
					originalPrompt: 1,
					enhancedPrompt: 1,
					createdAt: 1,
					projectId: 1,
					projectName: '$project.name',
					projectType: '$project.type',
					aspectRatio: '$project.aspectRatio'
				}
			},
			{
				// Sort by creation date (newest first)
				$sort: { createdAt: -1 }
			}
		]);

		// Group thumbnails by project type
		const groupedThumbnails = {
			youtube: thumbnails.filter(thumb => thumb.projectType === 'youtube'),
			reels: thumbnails.filter(thumb => thumb.projectType === 'reels')
		};

		return NextResponse.json({
			thumbnails: groupedThumbnails,
			totalCount: thumbnails.length,
			youtubeCount: groupedThumbnails.youtube.length,
			reelsCount: groupedThumbnails.reels.length
		});

	} catch (error) {
		console.error('Error fetching gallery thumbnails:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
