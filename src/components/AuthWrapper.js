'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'

export default function AuthWrapper({ children, signedInContent, signedOutContent }) {
  const { isLoaded, isSignedIn } = useUser()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted || !isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">🔄</div>
          <div>Loading...</div>
        </div>
      </div>
    )
  }

  if (isSignedIn) {
    return signedInContent || children
  } else {
    return signedOutContent || children
  }
}
