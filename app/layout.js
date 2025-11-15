import './globals.css'
import Header from '../components/Header'
import Footer from '../components/Footer'

export const metadata = {
  title: {
    default: 'ThingsNXT - IoT Integration Platform',
    template: '%s | ThingsNXT'
  },
  description: 'ThingsNXT Platform - Enterprise IoT integration for real-time data collection, smart device control, and intelligent automation. Connect, monitor, and control IoT devices seamlessly.',
  keywords: ['IoT', 'IoT platform', 'smart devices', 'real-time data', 'device control', 'IoT integration', 'smart automation', 'ThingsNXT'],
  authors: [{ name: 'ThingsNXT Team' }],
  creator: 'ThingsNXT',
  publisher: 'ThingsNXT',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://thingsnxt.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
    },
  },
  openGraph: {
    title: 'ThingsNXT - IoT Integration Platform',
    description: 'Enterprise IoT integration for real-time data collection and smart device control',
    url: 'https://thingsnxt.com',
    siteName: 'ThingsNXT',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ThingsNXT - IoT Integration Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ThingsNXT - IoT Integration Platform',
    description: 'Enterprise IoT integration for real-time data and smart device control',
    creator: '@thingsnxt',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/assets/react-logo.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/assets/react-logo.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/assets/react-logo@2x.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        <link rel="preload" href="/assets/adaptive-icon.png" as="image" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "ThingsNXT",
              "alternateName": "ThingsNXT Platform",
              "url": "https://thingsnxt.com",
              "logo": "https://thingsnxt.com/logo.png",
              "description": "Enterprise IoT integration platform for real-time data collection and smart device control",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Tech Hub, Innovation Drive",
                "addressLocality": "Silicon Valley",
                "addressRegion": "CA",
                "postalCode": "94000",
                "addressCountry": "US"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-555-123-4567",
                "contactType": "customer service",
                "areaServed": "US",
                "availableLanguage": "en"
              },
              "sameAs": [
                "https://twitter.com/thingsnxt",
                "https://linkedin.com/company/thingsnxt"
              ]
            })
          }}
        />
      </head>
      <body className="antialiased">
        <Header />
        <main id="main-content">
          {children}
        </main>
        <Footer />
        <a
          href="#main-content"
          className="skip-to-main"
          aria-label="Skip to main content"
        >
          Skip to main content
        </a>

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
      </body>
    </html>
  )
}