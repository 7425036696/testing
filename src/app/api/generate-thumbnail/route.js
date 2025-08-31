import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import sharp from 'sharp';
import { GoogleGenAI, Modality } from '@google/genai';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { connectDB } from '@/lib/mongo';
import Project from '@/models/Project';
import Image from '@/models/Image';
import Conversation from '@/models/Conversation';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const {
			prompt,
			refinedPrompt,
			file,
			useRefinedPrompt = false,
			projectId,
			isEditMode = false,
			originalThumbnailId = null,
		} = body;

		// Determine which prompt to use
		const activePrompt =
			useRefinedPrompt && refinedPrompt ? refinedPrompt : prompt;

		// Validate that we have both prompt and file
		if (!activePrompt || !file) {
			return NextResponse.json(
				{ error: 'Both prompt and file are required' },
				{ status: 400 }
			);
		}

		// Validate file data
		if (!file.data || !file.name || !file.type) {
			return NextResponse.json({ error: 'Invalid file data' }, { status: 400 });
		}

		// Connect to database and get project info
		await connectDB();
		let project = null;
		let aspectRatio = '16:9'; // default
		let conversation = null;

		if (projectId) {
			project = await Project.findOne({ _id: projectId, userId });
			if (!project) {
				return NextResponse.json(
					{ error: 'Project not found or access denied' },
					{ status: 404 }
				);
			}
			aspectRatio = project.aspectRatio;
			
			// Get or create conversation for this project
			conversation = await Conversation.findOrCreateForProject(
				projectId,
				userId,
				project.type || 'youtube',
				aspectRatio
			);
		}
		// If no projectId provided, maintain backward compatibility for legacy usage

		// Extract base64 data (remove data:image/jpeg;base64, prefix)
		const base64Data = file.data.split(',')[1];

		// Validate image dimensions based on project type
		const processedBase64 = await validateImageDimensions(
			base64Data,
			aspectRatio
		);

		console.log('Processing file:', {
			name: file.name,
			type: file.type,
			size: file.size,
			activePrompt: activePrompt,
			usingRefinedPrompt: useRefinedPrompt,
			projectId: projectId,
			aspectRatio: aspectRatio,
			isEditMode: isEditMode,
			originalThumbnailId: originalThumbnailId,
		});

		// Generate thumbnails with Google GenAI
		const result = await generateThumbnailsWithGoogleGenAI(
			activePrompt,
			processedBase64,
			aspectRatio,
			project?.type || 'youtube',
			isEditMode,
			conversation // Pass conversation context
		);

		console.log('Google GenAI response:', result.candidates[0].content);
		console.log(
			'Google GenAI response candidates count:',
			result.candidates.length
		);

	// Extract AI response text from the result for conversation history
	let aiResponseText = '';
	if (result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts) {
		const textParts = result.candidates[0].content.parts
			.filter(part => part.text)
			.map(part => part.text);
		aiResponseText = textParts.join('\n');
	}

	// Process the generated images and save them
	const thumbnails = await processGeneratedImages(
		result,
		projectId,
		userId,
		project?.type || 'youtube',
		aspectRatio,
		activePrompt,
		isEditMode,
		originalThumbnailId,
		conversation, // Pass conversation context
		aiResponseText // Pass AI response text
	);

	// Update project with new thumbnails if projectId is provided
	if (project && thumbnails.length > 0) {
		await updateProjectThumbnails(project, thumbnails);
	}

		return NextResponse.json({
			success: true,
			thumbnails: thumbnails,
			message: 'Thumbnails generated successfully',
			promptUsed: activePrompt,
			wasRefined: useRefinedPrompt && refinedPrompt && refinedPrompt !== prompt,
			isEditMode: isEditMode,
			originalThumbnailId: originalThumbnailId,
			aiResponse: aiResponseText, // Include AI response text in API response
			projectInfo: project
				? {
						id: project._id,
						name: project.name,
						type: project.type,
						aspectRatio: project.aspectRatio,
				  }
				: null,
		});
	} catch (error) {
		console.error('Error generating thumbnails:', error);
		return NextResponse.json(
			{ error: 'Failed to generate thumbnails' },
			{ status: 500 }
		);
	}
}

async function validateImageDimensions(base64Data, aspectRatio = '16:9') {
	const imageBuffer = Buffer.from(base64Data, 'base64');

	let width, height;

	// Set dimensions based on aspect ratio
	if (aspectRatio === '9:16') {
		width = 1080;
		height = 1920;
		console.log('Resizing image to 9:16 aspect ratio (Reels)');
	} else {
		width = 1920;
		height = 1080;
		console.log('Resizing image to 16:9 aspect ratio (YouTube)');
	}

	const processedBuffer = await sharp(imageBuffer)
		.resize(width, height, {
			fit: 'contain',
			background: { r: 255, g: 141, b: 141, alpha: 1 },
		})
		.png()
		.toBuffer();

	console.log('Image processed for aspect ratio:', aspectRatio);

	return processedBuffer.toString('base64');
}

async function generateThumbnailsWithGoogleGenAI(
	userPrompt,
	imageBase64,
	aspectRatio = '16:9',
	projectType = 'youtube',
	isEditMode = false,
	conversation = null
) {
	const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_IMAGE_KEY});

	let enhancedPrompt;
	
	if (isEditMode && conversation && conversation.history.length > 0) {
		// Get conversation context for token-optimized prompting
		const contextHistory = conversation.getContextForAPI(3000); // Reserve 1000 tokens for current request
		
		// Build conversation-aware prompt
		let conversationContext = '';
		if (contextHistory.length > 0) {
			conversationContext = `
=== CONVERSATION HISTORY ===
${contextHistory.map((ctx, index) => {
	if (ctx.role === 'system') return ctx.content;
	return `${ctx.role === 'user' ? 'USER REQUEST' : 'PREVIOUS RESULT'} ${index + 1}: ${ctx.content}`;
}).join('\n')}

=== CURRENT REQUEST ===`;
		}
		
		enhancedPrompt = `You are continuing an ongoing thumbnail editing conversation. 
${conversationContext}

Current modification request: ${userPrompt}

IMPORTANT INSTRUCTIONS:
- This is step ${conversation.history.length + 1} in an ongoing editing session
- Build upon the previous edits shown in the conversation history above
- Keep the overall design cohesive with previous changes
- Focus on making natural, iterative improvements
- Maintain ${aspectRatio} aspect ratio for ${projectType === 'youtube' ? 'YouTube' : 'Instagram Reels/social media'}
- The changes should feel like a natural progression from the conversation history

Please implement the current modification while maintaining consistency with all previous edits.`;
		
	} else if (isEditMode) {
		// Fallback for edit mode without conversation (backward compatibility)
		enhancedPrompt = `You are editing an existing thumbnail image. Based on the current image provided, please make the following modifications: ${userPrompt}. 

Keep the overall composition and style cohesive while implementing the requested changes. Maintain the ${aspectRatio} aspect ratio and ensure the result looks professional and engaging for ${projectType === 'youtube' ? 'YouTube' : 'Instagram Reels/social media'}.

Important: Focus on modifying the existing elements rather than creating an entirely new design. The changes should feel natural and integrated with the original image.`;
	} else {
		// New creation mode
		enhancedPrompt = userPrompt;
	}

	const prompt = [
		{
			text: enhancedPrompt,
		},
		{
			inlineData: {
				mimeType: 'image/png',
				data: imageBase64,
			},
		},
	];

	const response = await ai.models.generateContent({
		model: 'gemini-2.5-flash-image-preview',
		contents: prompt,
	});

	return response;
}

async function processGeneratedImages(
	result,
	projectId,
	userId,
	projectType = 'youtube',
	aspectRatio = '16:9',
	promptUsed = '',
	isEditMode = false,
	originalThumbnailId = null,
	conversation = null,
	aiResponseText = ''
) {
	// Use Vercel's temporary directory instead of creating a local directory
	const outputDir = '/tmp';
	
	// Ensure the tmp directory exists (it should on Vercel, but check anyway)
	try {
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}
	} catch (error) {
		console.error('Could not access temp directory:', error);
		// If we can't use /tmp, proceed without local file storage
	}

	const thumbnails = [];
	let imageCount = 0;

	for (const part of result.candidates[0].content.parts) {
		if (part.text) {
			console.log('AI Response Text:', part.text);
		} else if (part.inlineData) {
			const imageData = part.inlineData.data;
			const buffer = Buffer.from(imageData, 'base64');

			// Create temporary filename for Vercel's /tmp directory
			const tempFilename = projectId
				? `${isEditMode ? 'edited_' : ''}project_${projectId}_${Date.now()}_${imageCount}.png`
				: `${isEditMode ? 'edited_' : ''}user_${userId}_${Date.now()}_${imageCount}.png`;

			const tempFilepath = path.join(outputDir, tempFilename);

			try {
				// 1. Temporarily save to Vercel's /tmp filesystem (optional - for debugging)
				let tempFileCreated = false;
				try {
					fs.writeFileSync(tempFilepath, buffer);
					tempFileCreated = true;
					console.log(`📁 Temporary image saved: ${tempFilename}`);
				} catch (tempError) {
					console.warn('Could not save temp file (proceeding without):', tempError.message);
					// Continue without temp file - we can still upload to Cloudinary
				}

				// 2. Upload directly to Cloudinary from buffer
				const cloudinaryResult = await uploadToCloudinary(buffer, {
					projectId,
					userId,
					projectType,
					aspectRatio,
					isEditMode,
					originalThumbnailId,
				});

				// 3. Create thumbnail object with Cloudinary data
				const thumbnail = {
					id: `${Date.now()}_${imageCount}`,
					filename: tempFilename,
					// Use Cloudinary URL instead of local API endpoint
					url: cloudinaryResult.url,
					cloudinaryId: cloudinaryResult.cloudinaryId,
					cloudinaryUrl: cloudinaryResult.url,
					width: cloudinaryResult.width,
					height: cloudinaryResult.height,
					format: cloudinaryResult.format,
					bytes: cloudinaryResult.bytes,
					createdAt: new Date(),
					projectId: projectId,
				};

				// 4. Save to database if projectId exists
				if (projectId) {
					try {
						// Get conversation step number
						const conversationStep = conversation ? conversation.history.length + 1 : 1;
						const parentImageId = isEditMode && originalThumbnailId ? originalThumbnailId : null;

						const imageDoc = new Image({
							projectId: projectId,
							userId: userId,
							cloudinaryId: cloudinaryResult.cloudinaryId,
							cloudinaryUrl: cloudinaryResult.url,
							filename: tempFilename,
							aspectRatio: aspectRatio,
							width: cloudinaryResult.width,
							height: cloudinaryResult.height,
							format: cloudinaryResult.format,
							bytes: cloudinaryResult.bytes,
							promptUsed: promptUsed,
							projectType: projectType,
							tags: cloudinaryResult.tags || [],
							context: cloudinaryResult.context || {},
							status: 'completed',
							// Edit mode specific fields
							isEditMode: isEditMode,
							originalThumbnailId: originalThumbnailId,
							editedAt: isEditMode ? new Date() : undefined,
							// Conversation tracking fields
							conversationId: conversation?._id || null,
							conversationStep: conversationStep,
							parentImageId: parentImageId,
						});

						await imageDoc.save();
						console.log(`💾 Image saved to database: ${imageDoc._id}`);

						// Add database ID to thumbnail object
						thumbnail.dbId = imageDoc._id;

						// Update conversation history if conversation exists
						if (conversation) {
							// First add user request to conversation
							conversation.addInteraction(
								'user',
								promptUsed,
								imageDoc._id,
								conversation.estimateTokens(promptUsed),
								isEditMode ? 'edit' : 'create',
								parentImageId
							);

							// Then add AI response using the actual response text
							const aiResponse = aiResponseText || `Generated ${isEditMode ? 'edited' : 'new'} thumbnail successfully`;
							conversation.addInteraction(
								'assistant',
								aiResponse,
								imageDoc._id,
								conversation.estimateTokens(aiResponse),
								isEditMode ? 'edit' : 'create',
								parentImageId
							);

							await conversation.save();
							console.log(`💬 Conversation updated: ${conversation._id}`);
							console.log(`📝 AI Response captured: ${aiResponse.substring(0, 100)}${aiResponse.length > 100 ? '...' : ''}`);
						}

					} catch (dbError) {
						console.error('❌ Failed to save image to database:', dbError);
						// Continue without failing the entire process
					}
				}

				thumbnails.push(thumbnail);
				console.log(
					`☁️ Image uploaded to Cloudinary: ${cloudinaryResult.cloudinaryId}`
				);

				// 5. Delete local temp file immediately after successful upload (if it was created)
				if (tempFileCreated) {
					try {
						fs.unlinkSync(tempFilepath);
						console.log(`🗑️ Local temp file deleted: ${tempFilename}`);
					} catch (deleteError) {
						console.warn(
							`⚠️ Warning: Could not delete temp file ${tempFilename}:`,
							deleteError.message
						);
						// Don't throw error, continue with next image
					}
				}
			} catch (uploadError) {
				console.error(
					`❌ Failed to upload ${tempFilename} to Cloudinary:`,
					uploadError
				);

				// Clean up local file even if upload failed (if it exists)
				try {
					if (fs.existsSync(tempFilepath)) {
						fs.unlinkSync(tempFilepath);
						console.log(`🗑️ Cleaned up failed upload file: ${tempFilename}`);
					}
				} catch (cleanupError) {
					console.warn(
						`⚠️ Could not cleanup failed file ${tempFilename}:`,
						cleanupError.message
					);
				}

				// Continue with next image instead of failing entire process
				continue;
			}

			imageCount++;
		}
	}

	console.log(`✅ Processed ${thumbnails.length} images successfully`);
	return thumbnails;
}

async function updateProjectThumbnails(project, newThumbnails) {
	try {
		// Add new thumbnails to project
		project.thumbnails = project.thumbnails || [];
		project.thumbnails.push(...newThumbnails);
		project.thumbnailCount = project.thumbnails.length;
		project.updatedAt = new Date();

		await project.save();
		console.log(
			`Updated project ${project._id} with ${newThumbnails.length} new thumbnails`
		);
	} catch (error) {
		console.error('Error updating project thumbnails:', error);
	}
}