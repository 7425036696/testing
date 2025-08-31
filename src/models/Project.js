import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
	{
		userId: {
			type: String, // Clerk userId
			required: true,
			index: true,
		},
		name: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			enum: ['youtube', 'reels'],
			required: true,
		},
		aspectRatio: {
			type: String,
			required: true,
		},
		thumbnails: {
			type: Array,
			default: [],
		},
		thumbnailCount: {
			type: Number,
			default: 0,
		},
		// Legacy fields for backward compatibility
		title: {
			type: String,
		},
		prompt: {
			type: String,
		},
		status: {
			type: String,
			enum: ['pending', 'processing', 'completed', 'failed'],
			default: 'pending',
		},
	},
	{ timestamps: true }
);

export default mongoose.models.Project ||
	mongoose.model('Project', projectSchema);
