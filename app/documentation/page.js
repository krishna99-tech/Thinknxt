export default function Documentation() {
  const docs = [
    {
      title: "Getting Started",
      icon: "🚀",
      description: "Begin your IoT journey with our comprehensive starter guides",
      items: [
        { name: "Quick Start Guide", duration: "10 min read", level: "Beginner" },
        { name: "Platform Overview", duration: "15 min read", level: "Beginner" },
        { name: "First Device Setup", duration: "20 min read", level: "Beginner" },
        { name: "Architecture Overview", duration: "25 min read", level: "Intermediate" }
      ],
      color: "var(--primary-color)"
    },
    {
      title: "API Reference",
      icon: "🔌",
      description: "Complete API documentation for developers",
      items: [
        { name: "REST API", duration: "30 min read", level: "Intermediate" },
        { name: "WebSocket API", duration: "25 min read", level: "Advanced" },
        { name: "Authentication", duration: "15 min read", level: "Intermediate" },
        { name: "Rate Limits", duration: "10 min read", level: "Intermediate" },
        { name: "Webhooks", duration: "20 min read", level: "Advanced" }
      ],
      color: "var(--accent-color)"
    },
    {
      title: "Tutorials",
      icon: "🎓",
      description: "Step-by-step guides for common use cases",
      items: [
        { name: "Building Your First App", duration: "45 min", level: "Beginner" },
        { name: "Data Visualization", duration: "30 min", level: "Intermediate" },
        { name: "Security Best Practices", duration: "25 min", level: "Intermediate" },
        { name: "Real-time Analytics", duration: "35 min", level: "Advanced" },
        { name: "Device Management", duration: "40 min", level: "Intermediate" }
      ],
      color: "var(--success-color)"
    },
    {
      title: "Troubleshooting",
      icon: "🔧",
      description: "Solutions for common issues and errors",
      items: [
        { name: "Common Issues", duration: "20 min read", level: "All" },
        { name: "Debugging Guide", duration: "30 min read", level: "Intermediate" },
        { name: "Support Resources", duration: "10 min read", level: "All" },
        { name: "Performance Optimization", duration: "25 min read", level: "Advanced" },
        { name: "Migration Guide", duration: "40 min read", level: "Advanced" }
      ],
      color: "var(--warning-color)"
    },
    {
      title: "SDK & Libraries",
      icon: "📚",
      description: "Client libraries and SDK documentation",
      items: [
        { name: "JavaScript SDK", duration: "35 min read", level: "Intermediate" },
        { name: "Python Library", duration: "30 min read", level: "Intermediate" },
        { name: "Mobile SDKs", duration: "40 min read", level: "Advanced" },
        { name: "Embedded Systems", duration: "50 min read", level: "Advanced" }
      ],
      color: "#8b5cf6"
    },
    {
      title: "Best Practices",
      icon: "⭐",
      description: "Industry standards and recommendations",
      items: [
        { name: "Security Guidelines", duration: "25 min read", level: "All" },
        { name: "Scalability Patterns", duration: "30 min read", level: "Advanced" },
        { name: "Cost Optimization", duration: "20 min read", level: "Intermediate" },
        { name: "Monitoring & Logging", duration: "35 min read", level: "Intermediate" }
      ],
      color: "#06b6d4"
    }
  ]

  const quickLinks = [
    { name: "API Playground", href: "#", icon: "🎮", description: "Test API endpoints in real-time" },
    { name: "Code Samples", href: "#", icon: "💻", description: "Ready-to-use code examples" },
    { name: "Community Forum", href: "#", icon: "👥", description: "Get help from other developers" },
    { name: "Video Tutorials", href: "#", icon: "🎥", description: "Watch step-by-step guides" }
  ]

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="page-hero-content">
            <h1>Documentation</h1>
            <p>Comprehensive guides, references, and tutorials to help you build amazing IoT solutions with IoTConnect</p>
            <div className="hero-search">
              <div className="search-container">
                <input 
                  type="text" 
                  placeholder="Search documentation..." 
                  className="search-input"
                />
                <button className="search-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="documentation">
        <div className="container">
          {/* Quick Links Section */}
          <div className="quick-links-section">
            <h2>Quick Access</h2>
            <div className="quick-links-grid">
              {quickLinks.map((link, index) => (
                <a key={index} href={link.href} className="quick-link-card">
                  <div className="quick-link-icon">
                    <span>{link.icon}</span>
                  </div>
                  <div className="quick-link-content">
                    <h4>{link.name}</h4>
                    <p>{link.description}</p>
                  </div>
                  <div className="quick-link-arrow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Main Documentation Grid */}
          <div className="docs-header">
            <h2>Documentation Categories</h2>
            <p>Explore our comprehensive documentation organized by topics and skill levels</p>
          </div>

          <div className="docs-grid">
            {docs.map((section, index) => (
              <div key={index} className="docs-section" style={{ '--accent-color': section.color }}>
                <div className="docs-section-header">
                  <div className="docs-icon">
                    <span>{section.icon}</span>
                  </div>
                  <div className="docs-title">
                    <h3>{section.title}</h3>
                    <p>{section.description}</p>
                  </div>
                </div>
                <div className="docs-items">
                  {section.items.map((item, itemIndex) => (
                    <a key={itemIndex} href="#" className="docs-item">
                      <div className="item-content">
                        <span className="item-name">{item.name}</span>
                        <div className="item-meta">
                          <span className="item-duration">{item.duration}</span>
                          <span className={`item-level level-${item.level.toLowerCase()}`}>
                            {item.level}
                          </span>
                        </div>
                      </div>
                      <div className="item-arrow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </a>
                  ))}
                </div>
                <div className="docs-section-footer">
                  <a href="#" className="view-all-link">
                    View all {section.title} guides
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Resources Section */}
          <div className="resources-section">
            <div className="resources-content">
              <div className="resources-text">
                <h2>Need Additional Help?</h2>
                <p>Our support team is here to help you succeed with IoTConnect. Get personalized assistance for your specific use case.</p>
                <div className="resources-actions">
                  <button className="btn-primary">
                    Contact Support
                  </button>
                  <button className="btn-secondary">
                    Join Community
                  </button>
                </div>
              </div>
              <div className="resources-features">
                <div className="resource-feature">
                  <div className="feature-icon">💬</div>
                  <div className="feature-content">
                    <h4>24/7 Community Support</h4>
                    <p>Get help from thousands of developers</p>
                  </div>
                </div>
                <div className="resource-feature">
                  <div className="feature-icon">🔄</div>
                  <div className="feature-content">
                    <h4>Regular Updates</h4>
                    <p>Documentation updated weekly</p>
                  </div>
                </div>
                <div className="resource-feature">
                  <div className="feature-icon">🎯</div>
                  <div className="feature-content">
                    <h4>Expert Reviewed</h4>
                    <p>All content reviewed by IoT experts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}