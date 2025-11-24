'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    {
      icon: "🔗",
      title: "Seamless Connectivity",
      description: "Connect millions of devices with our robust, scalable infrastructure designed for global deployment",
      stats: "10M+ Devices Connected",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: "📊",
      title: "Real-time Analytics",
      description: "Get actionable insights from your data with AI-powered analytics and customizable dashboards",
      stats: "99.9% Uptime",
      color: "from-green-500 to-green-600"
    },
    {
      icon: "🔒",
      title: "Enterprise Security",
      description: "Military-grade security with end-to-end encryption, zero-trust architecture, and compliance certifications",
      stats: "SOC 2 Certified",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: "⚡",
      title: "High Performance",
      description: "Low latency and high throughput architecture designed for mission-critical IoT applications",
      stats: "<50ms Latency",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: "🌐",
      title: "Global Scale",
      description: "Deploy anywhere with our global edge network and multi-region data centers",
      stats: "15+ Regions",
      color: "from-cyan-500 to-cyan-600"
    },
    {
      icon: "🔄",
      title: "Easy Integration",
      description: "REST APIs, SDKs, and pre-built connectors for seamless integration with your existing systems",
      stats: "50+ Integrations",
      color: "from-pink-500 to-pink-600"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CTO at SmartManufacturing Inc",
      content: "IoTConnect reduced our device deployment time by 70% and provided insights we never thought possible.",
      avatar: "SC"
    },
    {
      name: "Marcus Rodriguez",
      role: "Lead Engineer at UrbanTech",
      content: "The platform's reliability and security gave us the confidence to scale to millions of devices.",
      avatar: "MR"
    },
    {
      name: "Emily Watson",
      role: "Product Manager at AgriTech Solutions",
      content: "Real-time analytics helped us optimize operations and reduce costs by 45% in the first quarter.",
      avatar: "EW"
    }
  ]

  return (
    <>
      {/* Enhanced Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
          </div>
        </div>
        <div className="container">
          <div className={`hero-content ${isVisible ? 'visible' : ''}`}>
            <div className="hero-badge">
              <span>🚀 Trusted by 10,000+ Companies</span>
            </div>
            <h1>
              Connect Your World with
              <span className="gradient-text"> ThingsNxt</span>
            </h1>
            <p>Transform your business with our enterprise-grade  ThingNXT platform. Connect, analyze, and automate at scale with unmatched security and performance.</p>
            <div className="hero-buttons">
              <Link href="/get-started" className="btn btn-primary btn-large">
                Start Free Trial
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link href="/demo" className="btn btn-secondary btn-large">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.752 11.168L10.18 7.09999C9.79101 6.70499 9.79901 6.07199 10.194 5.68299C10.342 5.54199 10.529 5.45999 10.724 5.42799C10.919 5.39599 11.119 5.41899 11.3 5.49199C11.481 5.56499 11.637 5.68599 11.748 5.84199L17.248 12.842C17.584 13.298 17.584 13.954 17.248 14.411L11.748 21.411C11.416 21.862 10.784 21.979 10.3 21.68C9.81601 21.381 9.65901 20.78 9.90701 20.279L14.752 11.168Z" fill="currentColor"/>
                </svg>
                Watch Demo
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">10M+</div>
                <div className="stat-label">Devices Connected</div>
              </div>
              <div className="stat">
                <div className="stat-number">99.9%</div>
                <div className="stat-label">Platform Uptime</div>
              </div>
              <div className="stat">
                <div className="stat-number">15+</div>
                <div className="stat-label">Global Regions</div>
              </div>
              <div className="stat">
                <div className="stat-number">&lt;50ms</div>
                <div className="stat-label">Average Latency</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="scroll-indicator">
          <div className="scroll-arrow"></div>
        </div>
      </section>

      {/* Trusted Companies Section */}
      <section className="trusted-by">
        <div className="container">
          <div className="trusted-by-content">
            <p className="trusted-label">Trusted by industry leaders</p>
            <div className="companies-grid">
              {['TechCorp', 'InnovateLabs', 'GlobalSystems', 'FutureTech', 'SmartSolutions', 'DataWorks'].map((company, index) => (
                <div key={index} className="company-logo">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose ThingsNXT?</h2>
            <p>Built for scale, designed for performance, trusted by enterprises worldwide</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="feature-icon-wrapper">
                  <div className="feature-icon">
                    {feature.icon}
                  </div>
                  <div className="feature-badge">
                    {feature.stats}
                  </div>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="feature-link">
                  <span>Learn more</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2>What Our Customers Say</h2>
            <p>Join thousands of companies transforming their business with ThingNXT</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-content">
                  <div className="quote-icon">"</div>
                  <p>{testimonial.content}</p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonial.avatar}
                  </div>
                  <div className="author-info">
                    <div className="author-name">{testimonial.name}</div>
                    <div className="author-role">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="use-cases">
        <div className="container">
          <div className="section-header">
            <h2>Powering Innovation Across Industries</h2>
            <p>Discover how ThingNXT drives digital transformation across various sectors</p>
          </div>
          <div className="use-cases-grid">
            <div className="use-case">
              <div className="use-case-icon">🏭</div>
              <h3>Smart Manufacturing</h3>
              <p>Optimize production lines and predictive maintenance</p>
            </div>
            <div className="use-case">
              <div className="use-case-icon">🏙️</div>
              <h3>Smart Cities</h3>
              <p>Connect urban infrastructure for better citizen services</p>
            </div>
            <div className="use-case">
              <div className="use-case-icon">🚚</div>
              <h3>Supply Chain</h3>
              <p>Real-time tracking and condition monitoring</p>
            </div>
            <div className="use-case">
              <div className="use-case-icon">🌱</div>
              <h3>Agriculture</h3>
              <p>Precision farming and environmental monitoring</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <div className="cta-text">
              <h2>Ready to Transform Your Business?</h2>
              <p>Join 10,000+ companies using ThinsNXT to drive innovation and growth. Start your free trial today.</p>
              <div className="cta-features">
                <div className="cta-feature">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>No credit card required</span>
                </div>
                <div className="cta-feature">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Free 30-day trial</span>
                </div>
                <div className="cta-feature">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Full platform access</span>
                </div>
              </div>
            </div>
            <div className="cta-actions">
              <Link href="/get-started" className="btn btn-primary btn-extra-large">
                Start Your Free Trial
              </Link>
              <Link href="/contact" className="btn btn-secondary">
                Talk to Sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}