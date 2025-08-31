import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Vercel limits
const MAX_REQUEST_SIZE = 4.5 * 1024 * 1024; // 4.5MB (leave buffer for headers)
const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB for base64 image

export async function POST(request) {
	try {
		// Check content length before parsing
		const contentLength = request.headers.get('content-length');
		if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
			return NextResponse.json(
				{ 
					error: 'Request too large. Please use a smaller image (max 3MB).',
					code: 'REQUEST_TOO_LARGE'
				},
				{ status: 413 }
			);
		}

		const body = await request.json();
		const { originalPrompt, imageMetadata, imageData, projectType } = body;

		// Validate input
		if (!originalPrompt || typeof originalPrompt !== 'string') {
			return NextResponse.json(
				{ error: 'Original prompt is required and must be a string' },
				{ status: 400 }
			);
		}

		// Validate project type
		if (!projectType || !['youtube', 'reels'].includes(projectType)) {
			return NextResponse.json(
				{
					error: 'Project type is required and must be either "youtube" or "reels"',
				},
				{ status: 400 }
			);
		}

		// Validate and compress image data if provided
		let processedImageData = null;
		if (imageData) {
			if (typeof imageData !== 'string') {
				return NextResponse.json(
					{ error: 'Image data must be a base64 string' },
					{ status: 400 }
				);
			}

			// Check image size
			const imageSizeBytes = (imageData.length * 3) / 4; // Rough base64 size calculation
			if (imageSizeBytes > MAX_IMAGE_SIZE) {
				return NextResponse.json(
					{ 
						error: 'Image too large. Please use an image smaller than 3MB.',
						code: 'IMAGE_TOO_LARGE'
					},
					{ status: 413 }
				);
			}

			processedImageData = imageData;
		}

		// Check if we have Google API key
		if (!process.env.GOOGLE_API_KEY) {
			return NextResponse.json(
				{ error: 'Google API key not found.' },
				{ status: 500 }
			);
		}

		// Call Google Gemini API for prompt enhancement
		const refinedPrompt = await enhancePromptWithGemini(
			originalPrompt,
			imageMetadata,
			processedImageData,
			projectType
		);

		return NextResponse.json({
			success: true,
			originalPrompt,
			refinedPrompt,
			method: 'gemini',
			suggestions: [
				'Enhanced for thumbnail creation',
				'Optimized visual elements',
				'Improved clarity and specificity',
			],
		});
	} catch (error) {
		console.error('Error enhancing prompt:', error);
		
		// Handle specific error types
		if (error.message?.includes('413') || error.message?.includes('too large')) {
			return NextResponse.json(
				{ 
					error: 'Request too large. Please use a smaller image.',
					code: 'REQUEST_TOO_LARGE'
				},
				{ status: 413 }
			);
		}

		return NextResponse.json(
			{ error: 'Failed to enhance prompt. Please try again.' },
			{ status: 500 }
		);
	}
}

async function enhancePromptWithGemini(
	originalPrompt,
	imageMetadata,
	imageData,
	projectType
) {
	// System prompt for YouTube thumbnail generation aspect ratio 16:9
	const systemPromptForYouTube = `
    You are an expert at crafting effective prompts for an AI image generation model, specifically for YouTube thumbnails.

Your task is to refine vague user prompts into a **concise, detailed prompt** optimized for thumbnail generation.

Requirements:
1. Keep the user's original intent, but expand it with strong visual details.
2. Always specify:
   - Subject focus (e.g., {user_image} if available, or described subject)
   - Background style & environment
   - Color scheme (vibrant, contrasting, eye-catching)
   - Lighting & mood
   - Text (if user mentioned it, otherwise omit)
   - Emotional expression or dramatic element (to grab attention)
   - Aspect ratio (16:9 for YouTube)
3. Make sure the design is **readable at small sizes** and has a clear focal point.
4. If a user provides an image:
   - Only include '{user_image}' if it is **relevant to the subject of the thumbnail**.  
   - If not relevant (e.g., topic is logos, abstract concepts, or non-personal visuals), ignore the image and focus on other elements.  
   - If relevant, place '{user_image}' as the **main focal point in the center**.
5. Respond **only with the final refined prompt**. Do not add explanations.

### Example Refinements

**User Prompt:** "me talking about AI"
**Refined Prompt:** "Create a bold YouTube thumbnail featuring {user_image} with a surprised expression, standing in front of a glowing futuristic circuit board background. Use a high-contrast palette of neon blue and electric pink. Add large bold text 'AI Explained!' in white with a glowing outline for readability. Ensure dramatic lighting, clear focal point, and 16:9 aspect ratio."

**User Prompt:** "cooking video"
**Refined Prompt:** "Design a vibrant YouTube thumbnail showing {user_image} holding a frying pan with steam rising. Use a bright kitchen background with warm yellow and red tones. Add bold text 'Easy Recipes!' in playful, chunky font at the bottom. Ensure strong contrast, excited facial expression, and 16:9 aspect ratio."

**User Prompt:** "gaming stream"
**Refined Prompt:** "Generate a dynamic YouTube thumbnail featuring {user_image} in a headset with an excited expression. Background should be a neon-lit gaming arena with glowing green and purple lights. Add text 'LIVE GAMING!' in bold, futuristic font across the top. Use high-energy lighting, vibrant contrast, and 16:9 aspect ratio."

**User Prompt:** "docker aws"
**Refined Prompt:** "Create a tech-focused YouTube thumbnail with a dark digital cloud background and glowing network elements. Place the Docker and AWS logos prominently in the center. Use a blue and orange contrasting palette. Add text 'Docker in AWS' in bold, modern font at the top. Keep it clean, readable, and 16:9 aspect ratio."
`;

	// System prompt for Reels thumbnail generation aspect ratio 9:16
	const systemPromptForReels = `
    You are an expert at crafting effective prompts for an AI image generation model, specifically for Instagram/TikTok Reels thumbnails.

Your task is to refine vague user prompts into a **concise, detailed prompt** optimized for vertical thumbnail generation.

Requirements:
1. Keep the user's original intent, but expand it with strong visual details.
2. Always specify:
   - Subject focus (e.g., {user_image} if available, or described subject)
   - Background style & environment (vertical-optimized)
   - Color scheme (vibrant, bold, mobile-friendly)
   - Lighting & mood
   - Text placement (consider vertical space and mobile viewing)
   - Emotional expression or dramatic element (to grab attention on mobile feeds)
   - Aspect ratio (9:16 for Reels)
3. Design for **mobile viewing** with larger elements and bold contrasts.
4. If a user provides an image:
   - Only include '{user_image}' if it is **relevant to the subject of the thumbnail**.  
   - If not relevant (e.g., topic is logos, abstract concepts, or non-personal visuals), ignore the image and focus on other elements.  
   - If relevant, place '{user_image}' as the **main focal point, positioned for vertical format**.
5. Respond **only with the final refined prompt**. Do not add explanations.

### Example Refinements

**User Prompt:** "me dancing"
**Refined Prompt:** "Create a vibrant Reels thumbnail featuring {user_image} mid-dance move with arms raised, against a colorful gradient background of pink and purple. Use dramatic lighting with rim light effect. Add bold text 'DANCE MOVES!' at the top in white with neon glow. Ensure high energy expression, mobile-optimized design, and 9:16 aspect ratio."

**User Prompt:** "fitness workout"
**Refined Prompt:** "Design an energetic Reels thumbnail showing {user_image} in workout gear doing a power pose. Use a gym background with neon lighting and motivational energy. Bright orange and blue color scheme. Add text 'GET FIT!' in bold, athletic font at the bottom. High contrast, determined expression, and 9:16 aspect ratio."

**User Prompt:** "food recipe"
**Refined Prompt:** "Generate a mouth-watering Reels thumbnail featuring {user_image} holding a delicious dish with steam rising. Warm kitchen background with golden hour lighting. Use appetizing colors - warm yellows and reds. Add text 'QUICK RECIPE' at the top in playful, food-themed font. Excited expression, mobile-friendly layout, and 9:16 aspect ratio."

**User Prompt:** "tech tips"
**Refined Prompt:** "Create a modern Reels thumbnail with {user_image} pointing at floating tech icons and code elements. Dark blue digital background with glowing accents. Use cyan and white contrasting colors. Add text 'TECH HACKS' in futuristic font at the top. Confident expression, vertical layout optimized, and 9:16 aspect ratio."
`;

	// Select the appropriate system prompt based on project type
	const systemPrompt =
		projectType === 'youtube' ? systemPromptForYouTube : systemPromptForReels;

	// Create user message
	let userMessage = `Original prompt: "${originalPrompt}"
${imageMetadata ? `Image context: ${JSON.stringify(imageMetadata)}` : ''}

Please refine this prompt for creating an effective ${
		projectType === 'youtube' ? 'YouTube' : 'Reels'
	} thumbnail.`;

	try {
		// Choose model based on whether we have image data
		const model = genAI.getGenerativeModel({
			model: 'gemini-1.5-flash', // Use consistent model
		});

		let result;

		if (imageData) {
			// Remove data URL prefix if present
			const base64Data = imageData.includes(',')
				? imageData.split(',')[1]
				: imageData;

			// Prepare image for Gemini
			const imagePart = {
				inlineData: {
					data: base64Data,
					mimeType: 'image/jpeg', // You might want to detect actual MIME type
				},
			};

			// Generate content with both text and image
			result = await model.generateContent([
				systemPrompt + '\n\n' + userMessage,
				imagePart,
			]);
		} else {
			// Generate content with text only
			result = await model.generateContent(systemPrompt + '\n\n' + userMessage);
		}

		const response = await result.response;
		const refinedPrompt = response.text().trim();

		return refinedPrompt || originalPrompt;
	} catch (error) {
		console.error('Gemini API error:', error);
		// Return original prompt as fallback
		return originalPrompt;
	}
}

// Add configuration for Vercel
export const config = {
	api: {
		bodyParser: {
			sizeLimit: '4mb', // Set explicit limit
		},
	},
};