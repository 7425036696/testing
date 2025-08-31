import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongo';
import Project from '@/models/Project';
import Image from '@/models/Image';

export async function GET(request, { params }) {
	try {
		const { userId } = await auth();
		
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { projectId } = await params;

		await connectDB();

		// Verify project ownership
		const project = await Project.findOne({
			_id: projectId,
			userId: userId
		});

		if (!project) {
			return NextResponse.json(
				{ error: 'Project not found or access denied' },
				{ status: 404 }
			);
		}

		// Fetch images for this project
		const images = await Image.find({
			projectId: projectId,
			userId: userId
		}).sort({ createdAt: -1 });

		// Transform images for frontend consumption
		const thumbnails = images.map(img => ({
			id: img._id.toString(),
			dbId: img._id.toString(),
			filename: img.filename,
			url: img.cloudinaryUrl,
			cloudinaryId: img.cloudinaryId,
			cloudinaryUrl: img.cloudinaryUrl,
			width: img.width,
			height: img.height,
			format: img.format,
			bytes: img.bytes,
			createdAt: img.createdAt,
			projectId: img.projectId.toString(),
			promptUsed: img.promptUsed,
			projectType: img.projectType,
			aspectRatio: img.aspectRatio,
			tags: img.tags,
			status: img.status,
			isSelected: img.isSelected
		}));

		return NextResponse.json({
			project: {
				id: project._id,
				name: project.name,
				type: project.type,
				aspectRatio: project.aspectRatio,
				thumbnailCount: images.length
			},
			thumbnails: thumbnails,
			count: images.length
		});

	} catch (error) {
		console.error('Error fetching project images:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
