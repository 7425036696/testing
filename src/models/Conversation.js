import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
	{
		projectId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Project',
			required: true,
			index: true,
		},
		userId: {
			type: String, // Clerk userId
			required: true,
			index: true,
		},
		// Conversation history array
		history: [
			{
				role: {
					type: String,
					enum: ['user', 'assistant'],
					required: true,
				},
				content: {
					type: String,
					required: true,
				},
				imageId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Image',
					required: true,
				},
				timestamp: {
					type: Date,
					default: Date.now,
				},
				// Token count for this specific interaction
				tokenCount: {
					type: Number,
					default: 0,
				},
				// Additional metadata
				promptType: {
					type: String,
					enum: ['create', 'edit', 'refine'],
					default: 'create',
				},
				// Reference to parent interaction (for edits)
				parentInteractionId: {
					type: mongoose.Schema.Types.ObjectId,
					default: null,
				},
			},
		],
		// Conversation metadata
		totalTokensUsed: {
			type: Number,
			default: 0,
		},
		maxContextLength: {
			type: Number,
			default: 10, // Keep last 10 interactions by default
		},
		// Current state
		currentImageId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Image',
		},
		lastInteractionAt: {
			type: Date,
			default: Date.now,
		},
		// Conversation status
		status: {
			type: String,
			enum: ['active', 'archived', 'paused'],
			default: 'active',
		},
		// Project context
		projectType: {
			type: String,
			enum: ['youtube', 'reels'],
			required: true,
		},
		aspectRatio: {
			type: String,
			default: '16:9',
		},
		// Auto-generated summary for token optimization
		summary: {
			type: String,
			default: '',
		},
		// When to regenerate summary
		lastSummaryUpdate: {
			type: Date,
			default: Date.now,
		},
	},
	{ 
		timestamps: true,
		// Add indexes for better performance
		indexes: [
			{ projectId: 1, userId: 1 },
			{ lastInteractionAt: -1 },
			{ status: 1 }
		]
	}
);

// Instance methods
conversationSchema.methods.addInteraction = function(role, content, imageId, tokenCount = 0, promptType = 'create', parentId = null) {
	this.history.push({
		role,
		content,
		imageId,
		tokenCount,
		promptType,
		parentInteractionId: parentId,
		timestamp: new Date(),
	});
	
	this.totalTokensUsed += tokenCount;
	this.currentImageId = imageId;
	this.lastInteractionAt = new Date();
	
	// Auto-trim history if it exceeds maxContextLength
	if (this.history.length > this.maxContextLength) {
		const removed = this.history.splice(0, this.history.length - this.maxContextLength);
		// Update summary when trimming (implement this logic later)
		this.summary = this.generateSummary(removed);
		this.lastSummaryUpdate = new Date();
	}
};

conversationSchema.methods.generateSummary = function(removedHistory = []) {
	// Simple summary generation (can be enhanced with AI later)
	const allHistory = [...removedHistory, ...this.history.slice(0, -2)]; // Don't summarize recent interactions
	if (allHistory.length === 0) return this.summary;
	
	const createSteps = allHistory.filter(h => h.promptType === 'create');
	const editSteps = allHistory.filter(h => h.promptType === 'edit');
	
	let summary = `Project Type: ${this.projectType} (${this.aspectRatio})\n`;
	
	if (createSteps.length > 0) {
		summary += `Original Creation: ${createSteps[0].content}\n`;
	}
	
	if (editSteps.length > 0) {
		summary += `Previous Edits: ${editSteps.map(e => e.content).join(' → ')}\n`;
	}
	
	return summary;
};

conversationSchema.methods.getContextForAPI = function(maxTokens = 4000) {
	// Get conversation history optimized for token limits
	let tokenCount = 0;
	const contextHistory = [];
	
	// Start with summary if available
	if (this.summary) {
		contextHistory.push({
			role: 'system',
			content: `Previous conversation summary: ${this.summary}`,
		});
		tokenCount += this.estimateTokens(this.summary);
	}
	
	// Add recent history (newest first, then reverse)
	const recentHistory = [...this.history].reverse();
	
	for (const interaction of recentHistory) {
		const estimatedTokens = this.estimateTokens(interaction.content);
		
		if (tokenCount + estimatedTokens > maxTokens) {
			break; // Stop if we exceed token limit
		}
		
		contextHistory.push({
			role: interaction.role,
			content: interaction.content,
			imageId: interaction.imageId,
			timestamp: interaction.timestamp,
		});
		
		tokenCount += estimatedTokens;
	}
	
	return contextHistory.reverse(); // Return in chronological order
};

conversationSchema.methods.estimateTokens = function(text) {
	// Rough estimation: 1 token ≈ 4 characters
	return Math.ceil(text.length / 4);
};

// Static methods
conversationSchema.statics.findOrCreateForProject = async function(projectId, userId, projectType = 'youtube', aspectRatio = '16:9') {
	let conversation = await this.findOne({ 
		projectId, 
		userId, 
		status: 'active' 
	});
	
	if (!conversation) {
		conversation = new this({
			projectId,
			userId,
			projectType,
			aspectRatio,
			history: [],
		});
	}
	
	return conversation;
};

export default mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
