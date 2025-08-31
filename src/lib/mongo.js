
import mongoose from 'mongoose';

let isConnected = false; // Track the connection state

export const connectDB = async () => {
	if (isConnected) {
		// Already connected
		return;
	}

	if (!process.env.MONGODB_URI) {
		throw new Error('❌ MONGODB_URI is not defined in .env');
	}

	try {
		const db = await mongoose.connect(process.env.MONGODB_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});

		isConnected = db.connections[0].readyState === 1;

		console.log('✅ MongoDB connected:', db.connection.host);
	} catch (err) {
		console.error('❌ MongoDB connection error:', err);
		throw new Error('Failed to connect to MongoDB');
	}
};
