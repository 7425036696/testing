import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongo';
import Project from '@/models/Project';

export async function GET() {
	try {
		const { userId } = await auth();
		
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		await connectDB();

		const projects = await Project.find({ userId })
			.sort({ updatedAt: -1 })
			.limit(20);

		return NextResponse.json({ projects });
	} catch (error) {
		console.error('Error fetching projects:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
