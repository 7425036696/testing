import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
	return (
		<div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
			{/* Background effects */}
			<div className="absolute inset-0">
				<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
				<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl"></div>
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-orange-500/5 to-orange-400/5 rounded-full blur-3xl"></div>
			</div>

			<div className="relative z-10 flex items-center justify-center min-h-screen p-4">
				<div className="flex justify-center flex-col items-center max-w-md w-full">
					<div className="text-center mb-8">
						<h1 className="text-4xl font-bold mb-2 text-white">
							Join Thumbly
						</h1>
						<p className="text-gray-400 text-lg leading-relaxed">
							Create your account and start generating amazing AI-powered thumbnails
						</p>
					</div>
					<div className="w-full">
						<SignUp routing="hash" />
					</div>
				</div>
			</div>
		</div>
	);
}
