'use client'

import { useEffect } from 'react'

export default function PageLoader() {
  useEffect(() => {
    const hideLoader = () => {
      const loader = document.getElementById('global-loader')
      if (loader) {
        loader.style.opacity = '0'
        loader.style.visibility = 'hidden'
        loader.style.pointerEvents = 'none'
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', hideLoader)
      return () => document.removeEventListener('DOMContentLoaded', hideLoader)
    } else {
      hideLoader()
    }
  }, [])

  return (
    <div id="global-loader" className="global-loader">
      <div className="loader-spinner">
        <div className="loader-icon">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="8" fill="url(#loaderGradient)" />
            <path d="M10 20L14 24L22 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="loaderGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  )
}