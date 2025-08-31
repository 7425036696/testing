import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		clerkUserId: {
			type: String,
			required: true,
			unique: true,
		},
		email: {
			type: String,
		},
		plan: {
			type: String,
			enum: ['free', 'pro'],
			default: 'free',
		},
	},
	{ timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', userSchema);
