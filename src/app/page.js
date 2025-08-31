'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function HomePage() {
	const { isLoaded, isSignedIn, user } = useUser();
	const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

	useEffect(() => {
		const handleMouseMove = (e) => {
			setMousePos({ x: e.clientX, y: e.clientY });
		};
		window.addEventListener('mousemove', handleMouseMove);
		return () => window.removeEventListener('mousemove', handleMouseMove);
	}, []);

	const ytSampleImages = ['/yt-01.png', '/yt-02.jpg', '/yt-03.jpg', '/yt-04.png'];
	const reelSampleImages = ['/reel-01.png', '/reel-02.jpg', '/reel-03.png', '/reel-04.png'];

	// Loading state
	if (!isLoaded) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
				<div className="text-center">
					<div className="relative">
						<div className="w-12 h-12 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
						<div className="absolute inset-0 w-12 h-12 border-2 border-cyan-400/20 border-b-cyan-400 rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
					</div>
					<div className="text-slate-300 text-lg font-medium">Initializing Craftix...</div>
				</div>
			</div>
		);
	}

	// Signed out content
	if (!isSignedIn) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
				{/* Dynamic animated background */}
				<div className="absolute inset-0">
					<div className="absolute top-1/4 left-1/6 w-96 h-96 bg-gradient-radial from-blue-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDuration: '8s'}}></div>
					<div className="absolute bottom-1/3 right-1/5 w-72 h-72 bg-gradient-radial from-cyan-400/15 via-cyan-400/8 to-transparent rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s', animationDuration: '6s'}}></div>
					<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-radial from-blue-500/8 via-blue-500/3 to-transparent rounded-full blur-3xl"></div>
					
					{/* Interactive cursor follow */}
					<div 
						className="absolute w-64 h-64 bg-gradient-radial from-cyan-400/10 to-transparent rounded-full blur-3xl pointer-events-none transition-all duration-1000 ease-out"
						style={{
							left: mousePos.x - 128,
							top: mousePos.y - 128,
						}}
					></div>
					
					{/* Enhanced grid */}
					<div className="absolute inset-0 opacity-[0.03]">
						<div className="h-full w-full" style={{
							backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)',
							backgroundSize: '48px 48px'
						}}></div>
					</div>
				</div>

				<div className="relative z-10">
					{/* Hero Section */}
					<div className="container mx-auto px-6 py-20">
						<div className="max-w-5xl mx-auto text-center">
							{/* Header */}
							<div className="mb-12">
								<div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-blue-500/20 rounded-full px-6 py-3 mb-8 hover:border-blue-400/40 transition-all duration-300">
									<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
									<span className="text-slate-300 text-sm font-medium">AI Thumbnail Generator</span>
									<div className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full font-medium">BETA</div>
								</div>
								
								<h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
									<span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent animate-pulse" style={{animationDuration: '3s'}}>
										Craftix
									</span>
								</h1>
								
								<div className="w-24 h-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 mx-auto rounded-full mb-8 shadow-lg shadow-blue-400/50"></div>
							</div>

							{/* Value Proposition */}
							<div className="mb-12 space-y-6">
								<h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
									Create <span className="relative">
										<span className="bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent">viral thumbnails</span>
										<div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400/60 to-blue-300/60 rounded-full"></div>
									</span> in seconds
								</h2>
								<p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
									AI-powered thumbnail creation for <span className="text-red-400 font-semibold px-2 py-1 bg-red-500/10 rounded-lg border border-red-500/20">YouTube</span> and <span className="text-purple-400 font-semibold px-2 py-1 bg-purple-500/10 rounded-lg border border-purple-500/20">Instagram Reels</span> that drives clicks and views
								</p>
							</div>

							{/* Enhanced CTA Buttons */}
							<div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
								<Link href="/sign-up">
									<button className="group relative bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:via-cyan-400 hover:to-blue-500 text-white px-10 py-4 rounded-xl text-lg font-bold transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/40">
										<span className="flex items-center gap-3 relative z-10">
											<span className="text-xl">🚀</span>
											Start Creating Free
											<div className="w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
										</span>
										<div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
									</button>
								</Link>
								<Link href="/sign-in">
									<button className="group backdrop-blur-sm bg-slate-800/60 border-2 border-slate-600 hover:border-blue-400/60 hover:bg-slate-800/80 text-slate-300 hover:text-white px-10 py-4 rounded-xl text-lg font-bold transition-all duration-300 hover:scale-105">
										<span className="flex items-center gap-3">
											<span className="text-xl group-hover:rotate-12 transition-transform duration-300">✨</span>
											Sign In
										</span>
									</button>
								</Link>
							</div>

							{/* Trust Indicators */}
							<div className="flex flex-wrap justify-center items-center gap-8 text-slate-500 text-sm">
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
									<span>No Credit Card Required</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
									<span>Free Forever Plan</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
									<span>10,000+ Happy Creators</span>
								</div>
							</div>
						</div>
					</div>

					{/* Enhanced Examples Section */}
					<div className="container mx-auto px-6 py-16">
						<div className="max-w-7xl mx-auto">
							<div className="text-center mb-16">
								<h3 className="text-3xl md:text-4xl font-bold mb-4">
									<span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
										See the Magic
									</span>
								</h3>
								<p className="text-slate-400 text-lg max-w-2xl mx-auto">Real thumbnails generated by our AI in under 3 seconds</p>
							</div>

							{/* YouTube Examples */}
							<div className="mb-20">
								<div className="flex items-center justify-center gap-4 mb-10">
									<div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
										<span className="text-2xl">📺</span>
									</div>
									<h4 className="text-2xl font-bold text-white">YouTube Thumbnails</h4>
									<div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-sm px-3 py-1 rounded-full font-bold shadow-lg">16:9</div>
								</div>
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
									{ytSampleImages.map((item, index) => (
										<div
											key={item}
											className="group relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/50 hover:border-blue-400/50 transition-all duration-500 hover:bg-slate-800/80 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
											<div className="aspect-video bg-slate-800 relative overflow-hidden">
												<Image
													src={item}
													alt={`YouTube Example ${index + 1}`}
													fill
													className="object-cover group-hover:scale-110 transition-transform duration-700"
												/>
												<div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
											</div>
											<div className="p-6 border-t border-slate-700/50">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-3">
														<div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
														<span className="text-slate-300 text-sm font-medium">Generated in 10s</span>
													</div>
													<div className="flex items-center gap-2">
														<div className="text-blue-400 text-sm font-bold">AI Powered</div>
														<div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Reels Examples */}
							<div className="mb-20">
								<div className="flex items-center justify-center gap-4 mb-10">
									<div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
										<span className="text-2xl">📱</span>
									</div>
									<h4 className="text-2xl font-bold text-white">Instagram Reels</h4>
									<div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm px-3 py-1 rounded-full font-bold shadow-lg">9:16</div>
								</div>
								<div className="flex justify-center">
									<div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl w-full">
										{reelSampleImages.map((item, index) => (
  <div
    key={item}
    className="group relative w-48 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/50 hover:border-purple-400/50 transition-all duration-500 hover:bg-slate-800/80 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
    
    <div className="aspect-[11/20] bg-slate-800 relative overflow-hidden">
      <Image
        src={item}
        alt={`Reel Example ${index + 1}`}
        fill
        className="object-cover group-hover:scale-110 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>

    <div className="p-4 border-t border-slate-700/50">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
          <span className="text-slate-300 text-sm font-medium">2.8s</span>
        </div>
      </div>
    </div>
  </div>
))}

									</div>
								</div>
							</div>

							{/* Enhanced Stats */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 max-w-4xl mx-auto">
								{[
									{ value: "50K+", label: "Thumbnails Created", color: "from-blue-400 to-cyan-400", icon: "🎨" },
									{ value: "2.1s", label: "Average Speed", color: "from-cyan-400 to-teal-400", icon: "⚡" },
									{ value: "97%", label: "User Satisfaction", color: "from-teal-400 to-green-400", icon: "🎯" }
								].map((stat, index) => (
									<div key={index} className="group text-center p-6 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl hover:border-blue-400/30 hover:bg-slate-800/60 transition-all duration-300">
										<div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
										<div className={`text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
											{stat.value}
										</div>
										<div className="text-slate-400 text-sm uppercase tracking-wider font-medium">{stat.label}</div>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Enhanced Features Section */}
					<div className="bg-gradient-to-r from-slate-900/50 via-blue-950/30 to-slate-900/50 backdrop-blur-sm border-y border-slate-800/50">
						<div className="container mx-auto px-6 py-16">
							<div className="max-w-6xl mx-auto">
								<div className="text-center mb-16">
									<h3 className="text-3xl md:text-4xl font-bold mb-4">
										<span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
											Why Choose Craftix?
										</span>
									</h3>
									<p className="text-slate-400 text-lg max-w-2xl mx-auto">Advanced AI technology meets creator needs</p>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
									{[
										{
											icon: "🎨",
											title: "Smart AI Design",
											description: "Advanced algorithms analyze trending patterns to create thumbnails that perform",
											accent: "blue",
											features: ["Style Transfer", "Color Psychology", "Trend Analysis"]
										},
										{
											icon: "⚡",
											title: "Lightning Fast",
											description: "Generate multiple high-quality variations in under 3 seconds",
											accent: "cyan",
											features: ["Instant Generation", "Batch Processing", "Cloud Powered"]
										},
										{
											icon: "🎯",
											title: "Conversion Focused",
											description: "Data-driven designs optimized for maximum click-through rates",
											accent: "purple",
											features: ["A/B Testing", "CTR Optimization", "Performance Analytics"]
										}
									].map((feature, index) => (
										<div
											key={index}
											className="group relative backdrop-blur-sm bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-slate-700/50 hover:border-slate-600/80 rounded-2xl p-8 transition-all duration-500 hover:bg-slate-800/80 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10">
											<div className="mb-6">
												<div className={`w-16 h-16 bg-gradient-to-br ${
													feature.accent === 'blue' ? 'from-blue-500 to-blue-600' :
													feature.accent === 'cyan' ? 'from-cyan-500 to-cyan-600' :
													'from-purple-500 to-purple-600'
												} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg ${
													feature.accent === 'blue' ? 'shadow-blue-500/30' :
													feature.accent === 'cyan' ? 'shadow-cyan-500/30' :
													'shadow-purple-500/30'
												}`}>
													<span className="text-2xl">{feature.icon}</span>
												</div>
											</div>
											<div className="mb-4">
												<h3 className="text-xl font-bold mb-3 text-white group-hover:text-cyan-300 transition-colors duration-300">
													{feature.title}
												</h3>
												<p className="text-slate-400 leading-relaxed mb-4">
													{feature.description}
												</p>
											</div>
											<div className="space-y-2">
												{feature.features.map((item, i) => (
													<div key={i} className="flex items-center gap-2">
														<div className={`w-1.5 h-1.5 rounded-full ${
															feature.accent === 'blue' ? 'bg-blue-400' :
															feature.accent === 'cyan' ? 'bg-cyan-400' :
															'bg-purple-400'
														}`}></div>
														<span className="text-slate-500 text-sm">{item}</span>
													</div>
												))}
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Social Proof Section */}
					<div className="container mx-auto px-6 py-16">
						<div className="max-w-4xl mx-auto text-center">
							<h3 className="text-2xl md:text-3xl font-bold mb-12">
								<span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
									Trusted by Creators Worldwide
								</span>
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
								{[
									{
										quote: "Craftix transformed my thumbnail game. My CTR increased by 340% in just two weeks!",
										author: "Sarah Chen",
										role: "YouTube Creator • 2.3M subs",
										avatar: "SC"
									},
									{
										quote: "The AI understands my brand perfectly. Every thumbnail looks professionally designed.",
										author: "Marcus Rodriguez",
										role: "Instagram Influencer • 890K followers",
										avatar: "MR"
									}
								].map((testimonial, index) => (
									<div key={index} className="group p-8 bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl hover:border-blue-400/30 hover:bg-slate-800/80 transition-all duration-300">
										<div className="mb-6">
											<div className="text-lg text-slate-300 leading-relaxed italic">
												"{testimonial.quote}"
											</div>
										</div>
										<div className="flex items-center gap-4">
											<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
												{testimonial.avatar}
											</div>
											<div className="text-left">
												<div className="text-white font-semibold">{testimonial.author}</div>
												<div className="text-slate-400 text-sm">{testimonial.role}</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Enhanced Signed in content
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
			{/* Dynamic animated background */}
			<div className="absolute inset-0">
				<div className="absolute top-1/4 left-1/6 w-96 h-96 bg-gradient-radial from-blue-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDuration: '8s'}}></div>
				<div className="absolute bottom-1/3 right-1/5 w-72 h-72 bg-gradient-radial from-cyan-400/15 via-cyan-400/8 to-transparent rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s', animationDuration: '6s'}}></div>
				
				{/* Interactive cursor follow */}
				<div 
					className="absolute w-64 h-64 bg-gradient-radial from-cyan-400/10 to-transparent rounded-full blur-3xl pointer-events-none transition-all duration-1000 ease-out"
					style={{
						left: mousePos.x - 128,
						top: mousePos.y - 128,
					}}
				></div>
			</div>

			<div className="relative z-10">
				{/* Welcome Section */}
				<div className="container mx-auto px-6 py-20">
					<div className="max-w-5xl mx-auto text-center">
						{/* Header */}
						<div className="mb-12">
							<div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-500/20 rounded-full px-6 py-3 mb-8">
								<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
								<span className="text-slate-300 text-sm font-medium">Welcome back, {user?.firstName}!</span>
								<div className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full font-medium">ACTIVE</div>
							</div>
							
							<h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
								<span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
									Craftix
								</span>
							</h1>
							
							<div className="w-24 h-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 mx-auto rounded-full mb-8 shadow-lg shadow-blue-400/50"></div>
						</div>

						{/* Personalized Greeting */}
						<div className="mb-12 space-y-6">
							<h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
								Ready to create your next <span className="relative">
									<span className="bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent">masterpiece</span>
									<div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400/60 to-blue-300/60 rounded-full"></div>
								</span>?
							</h2>
							<p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
								Your creative workspace is ready. Generate stunning thumbnails in seconds.
							</p>
						</div>

						{/* Enhanced CTA Buttons */}
						<div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
							<Link href="/dashboard">
								<button className="group relative bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:via-cyan-400 hover:to-blue-500 text-white px-10 py-4 rounded-xl text-lg font-bold transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/40">
									<span className="flex items-center gap-3 relative z-10">
										<span className="text-xl group-hover:rotate-12 transition-transform duration-300">⚡</span>
										Go to Dashboard
										<span className="text-xl group-hover:translate-x-2 transition-transform duration-300">→</span>
									</span>
									<div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
								</button>
							</Link>
							<Link href="/gallery">
								<button className="group backdrop-blur-sm bg-slate-800/60 border-2 border-slate-600 hover:border-blue-400/60 hover:bg-slate-800/80 text-slate-300 hover:text-white px-10 py-4 rounded-xl text-lg font-bold transition-all duration-300 hover:scale-105">
									<span className="flex items-center gap-3">
										<span className="text-xl group-hover:rotate-12 transition-transform duration-300">🖼️</span>
										View Gallery
									</span>
								</button>
							</Link>
						</div>

						{/* Quick Stats for logged in users */}
						
					</div>
				</div>

				{/* Examples Section for logged in users */}
				<div className="container mx-auto px-6 py-10">
					<div className="max-w-7xl mx-auto">
						<div className="text-center mb-16">
							<h3 className="text-3xl md:text-4xl font-bold mb-4">
								<span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
									Recent Creations
								</span>
							</h3>
							<p className="text-slate-400 text-lg">See what our AI can create for you</p>
						</div>

						{/* YouTube Examples */}
						<div className="mb-20">
							<div className="flex items-center justify-center gap-4 mb-10">
								<div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
									<span className="text-2xl">📺</span>
								</div>
								<h4 className="text-2xl font-bold text-white">YouTube Thumbnails</h4>
								<div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-sm px-3 py-1 rounded-full font-bold shadow-lg">16:9</div>
							</div>
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
								{ytSampleImages.map((item, index) => (
									<div
										key={item}
										className="group relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/50 hover:border-blue-400/50 transition-all duration-500 hover:bg-slate-800/80 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
										<div className="aspect-video bg-slate-800 relative overflow-hidden">
											<Image
												src={item}
												alt={`YouTube Example ${index + 1}`}
												fill
												className="object-cover group-hover:scale-110 transition-transform duration-700"
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
										</div>
										<div className="p-6 border-t border-slate-700/50">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-3">
													<div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
													<span className="text-slate-300 text-sm font-medium">Generated in 7.4s</span>
												</div>
												<div className="flex items-center gap-2">
													<div className="text-blue-400 text-sm font-bold">Create Similar</div>
													<div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Reels Examples */}
						<div className="mb-20">
							<div className="flex items-center justify-center gap-4 mb-10">
								<div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
									<span className="text-2xl">📱</span>
								</div>
								<h4 className="text-2xl font-bold text-white">Instagram Reels</h4>
								<div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm px-3 py-1 rounded-full font-bold shadow-lg">9:16</div>
							</div>
							<div className="flex justify-center">
								<div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl w-full">
									{reelSampleImages.map((item, index) => (
										<div
											key={item}
											className="group relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/50 hover:border-purple-400/50 transition-all duration-500 hover:bg-slate-800/80 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
											<div className="aspect-[9/16] bg-slate-800 relative overflow-hidden">
												<Image
													src={item}
													alt={`Reel Example ${index + 1}`}
													fill
													className="object-cover group-hover:scale-110 transition-transform duration-700"
												/>
												<div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
											</div>
											<div className="p-4 border-t border-slate-700/50">
												<div className="text-center">
													<div className="flex items-center justify-center gap-2">
														<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
														<span className="text-slate-300 text-sm font-medium">2.8s</span>
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Enhanced Features Section */}
				<div className="bg-gradient-to-r from-slate-900/50 via-blue-950/30 to-slate-900/50 backdrop-blur-sm border-y border-slate-800/50">
					<div className="container mx-auto px-6 py-16">
						<div className="max-w-6xl mx-auto">
							<div className="text-center mb-16">
								<h3 className="text-3xl md:text-4xl font-bold mb-4">
									<span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
										Your Creative Arsenal
									</span>
								</h3>
								<p className="text-slate-400 text-lg max-w-2xl mx-auto">Everything you need to dominate social media</p>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
								{[
									{
										icon: "🎨",
										title: "Smart AI Design",
										description: "Advanced algorithms analyze trending patterns to create thumbnails that perform",
										accent: "blue",
										features: ["Style Transfer", "Color Psychology", "Trend Analysis"]
									},
									{
										icon: "⚡",
										title: "Lightning Fast",
										description: "Generate multiple high-quality variations in under 3 seconds",
										accent: "cyan",
										features: ["Instant Generation", "Batch Processing", "Cloud Powered"]
									},
									{
										icon: "🎯",
										title: "Conversion Focused",
										description: "Data-driven designs optimized for maximum click-through rates",
										accent: "purple",
										features: ["A/B Testing", "CTR Optimization", "Performance Analytics"]
									}
								].map((feature, index) => (
									<div
										key={index}
										className="group relative backdrop-blur-sm bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-slate-700/50 hover:border-slate-600/80 rounded-2xl p-8 transition-all duration-500 hover:bg-slate-800/80 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10">
										<div className="mb-6">
											<div className={`w-16 h-16 bg-gradient-to-br ${
												feature.accent === 'blue' ? 'from-blue-500 to-blue-600' :
												feature.accent === 'cyan' ? 'from-cyan-500 to-cyan-600' :
												'from-purple-500 to-purple-600'
											} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg ${
												feature.accent === 'blue' ? 'shadow-blue-500/30' :
												feature.accent === 'cyan' ? 'shadow-cyan-500/30' :
												'shadow-purple-500/30'
											}`}>
												<span className="text-2xl">{feature.icon}</span>
											</div>
										</div>
										<div className="mb-4">
											<h3 className="text-xl font-bold mb-3 text-white group-hover:text-cyan-300 transition-colors duration-300">
												{feature.title}
											</h3>
											<p className="text-slate-400 leading-relaxed mb-4">
												{feature.description}
											</p>
										</div>
										<div className="space-y-2">
											{feature.features.map((item, i) => (
												<div key={i} className="flex items-center gap-2">
													<div className={`w-1.5 h-1.5 rounded-full ${
														feature.accent === 'blue' ? 'bg-blue-400' :
														feature.accent === 'cyan' ? 'bg-cyan-400' :
														'bg-purple-400'
													}`}></div>
													<span className="text-slate-500 text-sm">{item}</span>
												</div>
											))}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}