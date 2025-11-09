import './globals.css'
import Header from '../components/Header'
import Footer from '../components/Footer'

export const metadata = {
  title: {
    default: 'IoTConnect - Smart IoT Solutions',
    template: '%s | IoTConnect'
  },
  description: 'Leading IoT platform for connected devices and smart solutions. Connect, manage, and scale your IoT ecosystem with enterprise-grade security and real-time analytics.',
  keywords: ['IoT', 'Internet of Things', 'IoT platform', 'connected devices', 'smart solutions', 'IoT analytics', 'device management'],
  authors: [{ name: 'IoTConnect Team' }],
  creator: 'IoTConnect',
  publisher: 'IoTConnect',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://iotconnect.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
    },
  },
  openGraph: {
    title: 'IoTConnect - Smart IoT Solutions',
    description: 'Leading IoT platform for connected devices and smart solutions',
    url: 'https://iotconnect.com',
    siteName: 'IoTConnect',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'IoTConnect - Smart IoT Solutions',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IoTConnect - Smart IoT Solutions',
    description: 'Leading IoT platform for connected devices and smart solutions',
    creator: '@iotconnect',
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
    yahoo: 'your-yahoo-verification-code',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        {/* Preload critical images */}
        <link rel="preload" href="/images/hero-bg.jpg" as="image" />
        
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "IoTConnect",
              "alternateName": "IoTConnect Platform",
              "url": "https://iotconnect.com",
              "logo": "https://iotconnect.com/logo.png",
              "description": "Leading IoT platform for connected devices and smart solutions",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "123 Tech Park",
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
                "https://twitter.com/iotconnect",
                "https://linkedin.com/company/iotconnect"
              ]
            })
          }}
        />
      </head>
      <body className="antialiased">
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="skip-to-main"
          aria-label="Skip to main content"
        >
          Skip to main content
        </a>

        {/* Loading spinner for initial load */}
        <div id="global-loader" className="global-loader">
          <div className="loader-spinner">
            <div className="loader-icon">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="8" fill="url(#loaderGradient)"/>
                <path d="M10 20L14 24L22 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 20L14 24" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="loaderGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#2563eb"/>
                    <stop offset="1" stopColor="#1e40af"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <p>Loading IoTConnect...</p>
          </div>
        </div>

        <Header />
        
        <main id="main-content">
          {children}
        </main>
        
        <Footer />

        {/* Back to top button */}
        <button
          id="back-to-top"
          className="back-to-top"
          aria-label="Back to top"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Toast notification container */}
        <div id="toast-container" className="toast-container"></div>

        {/* Script for enhanced functionality */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Remove loader when page loads
              window.addEventListener('load', function() {
                const loader = document.getElementById('global-loader');
                if (loader) {
                  loader.style.opacity = '0';
                  setTimeout(() => loader.remove(), 300);
                }
              });

              // Back to top functionality
              const backToTop = document.getElementById('back-to-top');
              if (backToTop) {
                window.addEventListener('scroll', function() {
                  if (window.pageYOffset > 300) {
                    backToTop.classList.add('visible');
                  } else {
                    backToTop.classList.remove('visible');
                  }
                });

                backToTop.addEventListener('click', function() {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                });
              }

              // Service Worker Registration (if using PWA)
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('SW registered: ', registration);
                    },
                    function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    }
                  );
                });
              }

              // Performance monitoring
              if ('performance' in window) {
                window.addEventListener('load', function() {
                  setTimeout(function() {
                    const perfData = window.performance.timing;
                    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                    const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
                    
                    console.log('Page Load Time:', pageLoadTime + 'ms');
                    console.log('DOM Ready Time:', domReadyTime + 'ms');
                    
                    // Send to analytics (example)
                    if (typeof gtag !== 'undefined') {
                      gtag('event', 'timing_complete', {
                        'name': 'page_load',
                        'value': pageLoadTime,
                        'event_category': 'Load Time'
                      });
                    }
                  }, 0);
                });
              }
            `
          }}
        />
      </body>
    </html>
  )
}