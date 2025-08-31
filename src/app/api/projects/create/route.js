import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongo';
import Project from '@/models/Project';

export async function POST(request) {
	try {
		const { userId } = await auth();
		
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { type, name, aspectRatio } = body;

		// Validate input
		if (!type || !name || !aspectRatio) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		if (!['youtube', 'reels'].includes(type)) {
			return NextResponse.json(
				{ error: 'Invalid project type' },
				{ status: 400 }
			);
		}

		await connectDB();

		// Create new project
		const project = new Project({
			userId,
			type,
			name,
			aspectRatio,
			thumbnails: [],
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		await project.save();

		return NextResponse.json({
			projectId: project._id.toString(),
			project: project
		});
	} catch (error) {
		console.error('Error creating project:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
