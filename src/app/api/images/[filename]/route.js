import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import * as fs from 'node:fs';
import path from 'path';

export async function GET(request, { params }) {
	try {
		const { userId } = await auth();
		
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { filename } = params;
		
		// Security: Validate filename to prevent directory traversal
		if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
			return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
		}

		// Check if filename belongs to user or their project (more flexible check for development)
		const isAuthorized = filename.includes(`user_${userId}_`) || 
							 filename.startsWith('project_') ||
							 filename.startsWith('geminiImage_') || // Legacy support
							 filename.endsWith('.png') || filename.endsWith('.jpg') || filename.endsWith('.jpeg'); // Development fallback

		if (!isAuthorized) {
			return NextResponse.json({ error: 'Access denied' }, { status: 403 });
		}

		const imagePath = path.join(process.cwd(), 'generated_images', filename);
		
		// Check if file exists
		if (!fs.existsSync(imagePath)) {
			return NextResponse.json({ error: 'Image not found' }, { status: 404 });
		}

		// Read and serve the image
		const imageBuffer = fs.readFileSync(imagePath);
		
		// Determine content type based on extension
		let contentType = 'image/png'; // default
		const extension = path.extname(filename).toLowerCase();
		switch (extension) {
			case '.jpg':
			case '.jpeg':
				contentType = 'image/jpeg';
				break;
			case '.png':
				contentType = 'image/png';
				break;
			case '.webp':
				contentType = 'image/webp';
				break;
		}

		return new NextResponse(imageBuffer, {
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'public, max-age=31536000, immutable',
			},
		});
	} catch (error) {
		console.error('Error serving image:', error);
		return NextResponse.json(
			{ error: 'Failed to serve image' },
			{ status: 500 }
		);
	}
}
