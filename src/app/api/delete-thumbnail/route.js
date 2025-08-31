import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/mongo';
import Image from '@/models/Image';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(request) {
	try {
		const { userId } = await auth();
		console.log('🔍 Delete thumbnail - User ID:', userId);
		
		if (!userId) {
			console.log('❌ No user ID found in auth');
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const imageId = searchParams.get('id');
		console.log('🗑️ Deleting image ID:', imageId);

		if (!imageId) {
			return NextResponse.json(
				{ error: 'Image ID is required' },
				{ status: 400 }
			);
		}

		await connectDB();

		// Find the image in the database
		const image = await Image.findById(imageId);
		console.log('🔍 Found image:', image ? 'Yes' : 'No');
		console.log('📝 Image userId:', image?.userId);
		console.log('👤 Auth userId:', userId);
		
		if (!image) {
			return NextResponse.json({ error: 'Image not found' }, { status: 404 });
		}

		// Verify the image belongs to the user
		if (image.userId !== userId) {
			console.log('❌ User mismatch - Image belongs to:', image.userId, 'but user is:', userId);
			return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
		}

		// Delete from Cloudinary if cloudinaryId exists
		if (image.cloudinaryId) {
			try {
				await cloudinary.uploader.destroy(image.cloudinaryId);
				console.log(`Deleted image from Cloudinary: ${image.cloudinaryId}`);
			} catch (cloudinaryError) {
				console.error('Error deleting from Cloudinary:', cloudinaryError);
				// Continue with database deletion even if Cloudinary deletion fails
			}
		}

		// Delete from database
		await Image.findByIdAndDelete(imageId);

		return NextResponse.json({
			success: true,
			message: 'Thumbnail deleted successfully',
			deletedId: imageId,
		});
	} catch (error) {
		console.error('Error deleting thumbnail:', error);
		return NextResponse.json(
			{ error: 'Failed to delete thumbnail' },
			{ status: 500 }
		);
	}
}
