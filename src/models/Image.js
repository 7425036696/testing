import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
	{
		projectId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Project',
			required: true,
		},
		userId: {
			type: String, // Clerk userId
			required: true,
			index: true,
		},
		// Cloudinary data
		cloudinaryId: {
			type: String,
			required: true,
			unique: true,
		},
		cloudinaryUrl: {
			type: String,
			required: true,
		},
		// Image metadata
		filename: {
			type: String,
			required: true,
		},
		aspectRatio: {
			type: String,
			default: '16:9',
		},
		width: {
			type: Number,
			required: true,
		},
		height: {
			type: Number,
			required: true,
		},
		format: {
			type: String,
			required: true,
		},
		bytes: {
			type: Number,
			required: true,
		},
		// Generation context
		promptUsed: {
			type: String,
		},
		projectType: {
			type: String,
			enum: ['youtube', 'reels'],
			required: true,
		},
		// Tags and metadata
		tags: [
			{
				type: String,
			},
		],
		context: {
			type: mongoose.Schema.Types.Mixed,
		},
		// Status and selection
		status: {
			type: String,
			enum: ['processing', 'completed', 'failed'],
			default: 'completed',
		},
		isSelected: {
			type: Boolean,
			default: false,
		},
		// Edit tracking fields
		isEditMode: {
			type: Boolean,
			default: false,
		},
		originalThumbnailId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Image',
			default: null,
		},
		editedAt: {
			type: Date,
			default: null,
		},
		// Conversation tracking fields
		conversationId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Conversation',
			default: null,
		},
		conversationStep: {
			type: Number, // Which step in the conversation this represents
			default: 1,
		},
		parentImageId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Image',
			default: null, // Different from originalThumbnailId - this tracks immediate parent
		},
	},
	{ timestamps: true }
);

// Create indexes for better query performance
imageSchema.index({ userId: 1, projectId: 1 });
imageSchema.index({ createdAt: -1 });

export default mongoose.models.Image || mongoose.model('Image', imageSchema);
