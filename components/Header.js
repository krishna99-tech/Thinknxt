'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import './Header.css'

const HeaderBackgroundLoader = () => {
  const elements = [
    { type: 'server', top: '20%', left: '10%', delay: '0s' },
    { type: 'server', top: '60%', left: '85%', delay: '1s' },
    { type: 'database', top: '30%', left: '80%', delay: '0.5s' },
    { type: 'database', top: '70%', left: '5%', delay: '1.5s' },
    { type: 'line', top: '25%', left: '15%', width: '30%', delay: '0s' },
    { type: 'line', top: '65%', left: '25%', width: '25%', delay: '1.5s' },
    { type: 'node', top: '40%', left: '50%', delay: '0s' },
    { type: 'node', top: '50%', left: '30%', delay: '1s' },
    { type: 'node', top: '30%', left: '70%', delay: '2s' },
    { type: 'circle', top: '50%', left: '60%', size: '40px', delay: '0s' },
    { type: 'circle', top: '20%', left: '40%', size: '60px', delay: '1s' },
  ];

  return (
    <div className="header-background-loader">
      {elements.map((element, index) => (
        <div
          key={index}
          className={
            element.type === 'server' ? 'header-loader-server' :
            element.type === 'database' ? 'header-loader-database' :
            element.type === 'line' ? 'header-connection-line' :
            element.type === 'node' ? 'header-loader-node' : 'header-loader-circle'
          }
          style={{
            top: element.top,
            left: element.left,
            width: element.size,
            height: element.size,
            animationDelay: element.delay,
          }}
        />
      ))}
    </div>
  );
};

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/documentation', label: 'Documentation' },
    { href: '/support', label: 'Support' },
    { href: '/contact', label: 'Contact' }
  ]

  const isActive = (href) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <HeaderBackgroundLoader />
      <div className="container">
        <div className="logo">
          <Link href="/" className="logo-link">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="url(#logoGradient)"/>
                <path d="M10 16L14 20L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 16L14 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="logoGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#2563eb"/>
                    <stop offset="1" stopColor="#1e40af"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="logo-text">ThingNXT</span>
          </Link>
        </div>
        
        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
              {isActive(item.href) && <div className="active-indicator" />}
            </Link>
          ))}
          <div className="header-actions-mobile">
            <Link href="/login" className="btn-login" onClick={() => setIsMenuOpen(false)}>
              Sign In
            </Link>
            <Link href="/get-started" className="btn-get-started" onClick={() => setIsMenuOpen(false)}>
              Get Started
            </Link>
          </div>
        </nav>

        <div className="header-actions">
          <Link href="/login" className="btn-login">
            Sign In
          </Link>
          <Link href="/get-started" className="btn-get-started">
            Get Started
          </Link>
        </div>

        <button 
          className={`menu-toggle ${isMenuOpen ? 'menu-open' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  )
}