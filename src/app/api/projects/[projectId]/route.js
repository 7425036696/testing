import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongo';
import Project from '@/models/Project';
import Image from '@/models/Image';
import { deleteFromCloudinary } from '@/lib/cloudinary';

export async function GET(request, { params }) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { projectId } = await params;

		await connectDB();

		const project = await Project.findOne({
			_id: projectId,
			userId: userId,
		});

		if (!project) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 });
		}

		return NextResponse.json({ project });
	} catch (error) {
		console.error('Error fetching project:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

export async function DELETE(request, { params }) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { projectId } = await params;

		await connectDB();

		// Find the project and verify ownership
		const project = await Project.findOne({
			_id: projectId,
			userId: userId,
		});

		if (!project) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 });
		}

		// Find all images associated with this project
		const images = await Image.find({ projectId: projectId });

		// Delete all images from Cloudinary
		const cloudinaryDeletions = images.map(async (image) => {
			if (image.cloudinaryId) {
				try {
					await deleteFromCloudinary(image.cloudinaryId);
					console.log(`Deleted image ${image.cloudinaryId} from Cloudinary`);
				} catch (error) {
					console.error(`Failed to delete image ${image.cloudinaryId} from Cloudinary:`, error);
				}
			}
		});

		// Wait for all Cloudinary deletions to complete
		await Promise.allSettled(cloudinaryDeletions);

		// Delete all images from database
		await Image.deleteMany({ projectId: projectId });

		// Delete the project from database
		await Project.findByIdAndDelete(projectId);

		console.log(`Project ${projectId} and ${images.length} associated images deleted successfully`);

		return NextResponse.json({ 
			message: 'Project deleted successfully',
			deletedImages: images.length
		});

	} catch (error) {
		console.error('Error deleting project:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
