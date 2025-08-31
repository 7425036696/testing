import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import JSZip from 'jszip';
import { connectDB } from '@/lib/mongo';
import Project from '@/models/Project';
import Image from '@/models/Image';

export async function POST(request) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { projectId, thumbnailIds } = body;

		if (!projectId && !thumbnailIds) {
			return NextResponse.json(
				{ error: 'Either projectId or thumbnailIds must be provided' },
				{ status: 400 }
			);
		}

		await connectDB();

		let thumbnails = [];

		if (projectId) {
			// Download all thumbnails from a specific project
			const project = await Project.findOne({ _id: projectId, userId });
			if (!project) {
				return NextResponse.json(
					{ error: 'Project not found or access denied' },
					{ status: 404 }
				);
			}

			// Get all images for this project
			thumbnails = await Image.find({ projectId, userId }).sort({ createdAt: -1 });
		} else if (thumbnailIds && thumbnailIds.length > 0) {
			// Download specific thumbnails
			thumbnails = await Image.find({ 
				_id: { $in: thumbnailIds }, 
				userId 
			}).sort({ createdAt: -1 });
		}

		if (thumbnails.length === 0) {
			return NextResponse.json(
				{ error: 'No thumbnails found' },
				{ status: 404 }
			);
		}

		// Create ZIP file
		const zip = new JSZip();
		const downloadPromises = [];

		for (let i = 0; i < thumbnails.length; i++) {
			const thumbnail = thumbnails[i];
			const variationNumber = thumbnails.length - i;
			
			// Generate filename
			const timestamp = new Date(thumbnail.createdAt).toISOString().slice(0, 19).replace(/:/g, '-');
			const filename = `thumbnail-variation-${variationNumber}-${timestamp}.png`;

			// Download image from Cloudinary
			const imagePromise = fetch(thumbnail.cloudinaryUrl)
				.then(response => {
					if (!response.ok) {
						throw new Error(`Failed to download image: ${response.statusText}`);
					}
					return response.arrayBuffer();
				})
				.then(arrayBuffer => {
					zip.file(filename, arrayBuffer);
					console.log(`Added ${filename} to ZIP`);
				})
				.catch(error => {
					console.error(`Failed to download ${thumbnail.cloudinaryUrl}:`, error);
					// Continue with other files even if one fails
				});

			downloadPromises.push(imagePromise);
		}

		// Wait for all downloads to complete
		await Promise.allSettled(downloadPromises);

		// Generate ZIP file
		const zipBuffer = await zip.generateAsync({ 
			type: 'nodebuffer',
			compression: 'DEFLATE',
			compressionOptions: {
				level: 6
			}
		});

		// Create ZIP filename
		const project = projectId ? await Project.findById(projectId) : null;
		const projectName = project ? project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'thumbnails';
		const zipFilename = `${projectName}_thumbnails_${Date.now()}.zip`;

		console.log(`Created ZIP file: ${zipFilename} (${zipBuffer.length} bytes)`);

		// Return ZIP file as response
		return new NextResponse(zipBuffer, {
			status: 200,
			headers: {
				'Content-Type': 'application/zip',
				'Content-Disposition': `attachment; filename="${zipFilename}"`,
				'Content-Length': zipBuffer.length.toString(),
			},
		});
	} catch (error) {
		console.error('Error creating ZIP download:', error);
		return NextResponse.json(
			{ error: 'Failed to create ZIP download' },
			{ status: 500 }
		);
	}
}
