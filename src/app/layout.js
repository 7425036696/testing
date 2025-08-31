import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata = {
	title: 'Craftix - AI Thumbnail Generator',
	description: 'Generate stunning thumbnails effortlessly with Craftix.',
};

export default function RootLayout({ children }) {
	return (
		<ClerkProvider
			appearance={{
				baseTheme: dark,
				variables: {
					colorPrimary: '#0ea5e9', // Cyan-500 to match homepage
					colorPrimaryLight: '#67e8f9', // Cyan-300
					colorText: '#f1f5f9', // Slate-100
					colorTextSecondary: '#94a3b8', // Slate-400
					colorBackground: '#0f172a', // Slate-950
					colorInputBackground: '#1e293b', // Slate-800
					colorInputText: '#f1f5f9', // Slate-100
					borderRadius: '0.75rem', // Rounded-xl
				},
				elements: {
					card: 'backdrop-blur-lg bg-slate-900/80 border border-slate-700/50 shadow-xl shadow-blue-500/10',
					headerTitle: 'text-white font-semibold',
					headerSubtitle: 'text-slate-400',
					socialButtonsBlockButton: 'border border-slate-600 hover:border-blue-400/50 bg-slate-800/50 hover:bg-slate-800/80 transition-all duration-300',
					formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg hover:shadow-blue-500/30 transition-all duration-300',
					formFieldInput: 'bg-slate-800/60 border-slate-600 focus:border-blue-400 text-white placeholder:text-slate-500',
					footerActionLink: 'text-blue-400 hover:text-cyan-300 transition-colors duration-300',
				},
			}}>
			<html lang="en">
				<body
					className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 min-h-screen`}>
					<Navbar />
					<main className="relative">
						{children}
					</main>
				</body>
			</html>
		</ClerkProvider>
	);
}