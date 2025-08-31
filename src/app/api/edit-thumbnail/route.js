
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/mongo';
import Image from '@/models/Image';

/**
 * API endpoint specifically for editing existing thumbnails
 * This redirects to the main generate-thumbnail endpoint with edit mode enabled
 */
export async function POST(request) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { thumbnailId, editPrompt, projectId } = body;

		// Validate required fields
		if (!thumbnailId || !editPrompt) {
			return NextResponse.json(
				{ error: 'Thumbnail ID and edit prompt are required' },
				{ status: 400 }
			);
		}

		// Connect to database and verify thumbnail ownership
		await connectDB();
		const originalThumbnail = await Image.findOne({
			_id: thumbnailId,
			userId: userId,
		});

		if (!originalThumbnail) {
			return NextResponse.json(
				{ error: 'Thumbnail not found or access denied' },
				{ status: 404 }
			);
		}

		// Fetch the original image from Cloudinary URL
		const response = await fetch(originalThumbnail.cloudinaryUrl);
		if (!response.ok) {
			throw new Error('Failed to fetch original image');
		}

		const blob = await response.blob();
		const base64 = await new Promise((resolve) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result);
			reader.readAsDataURL(blob);
		});

		// Prepare file data for the generate-thumbnail endpoint
		const fileData = {
			data: base64,
			name: `edited_${originalThumbnail.filename}`,
			type: 'image/png',
			size: blob.size,
		};

		// Call the main generate-thumbnail endpoint with edit mode
		const generateResponse = await fetch(
			new URL('/api/generate-thumbnail', request.url),
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': request.headers.get('Authorization') || '',
					'Cookie': request.headers.get('Cookie') || '',
				},
				body: JSON.stringify({
					projectId: projectId || originalThumbnail.projectId,
					prompt: editPrompt,
					file: fileData,
					isEditMode: true,
					originalThumbnailId: thumbnailId,
				}),
			}
		);

		if (!generateResponse.ok) {
			const errorData = await generateResponse.json();
			return NextResponse.json(
				{ error: errorData.error || 'Failed to edit thumbnail' },
				{ status: generateResponse.status }
			);
		}

		const result = await generateResponse.json();

		return NextResponse.json({
			success: true,
			...result,
			message: 'Thumbnail edited successfully',
			originalThumbnail: {
				id: originalThumbnail._id,
				url: originalThumbnail.cloudinaryUrl,
			},
		});
	} catch (error) {
		console.error('Error editing thumbnail:', error);
		return NextResponse.json(
			{ error: 'Failed to edit thumbnail' },
			{ status: 500 }
		);
	}
}
