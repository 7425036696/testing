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
	title: 'Thumbly - AI Thumbnail Generator',
	description: 'Generate stunning thumbnails effortlessly with Thumbly.',
};

export default function RootLayout({ children }) {
	return (
		<ClerkProvider
			appearance={{
				baseTheme: dark,
				variables: {
					colorPrimary: '#f97316',
				},
			}}>
			<html lang="en">
				<body
					className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
					<Navbar />
					<div className="max-w-screen-xl mx-auto">
						{children}
					</div>
				</body>
			</html>
		</ClerkProvider>
	);
}
