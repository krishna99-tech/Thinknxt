export default function Support() {
  const supportOptions = [
    {
      icon: "📚",
      title: "Knowledge Base",
      description: "Browse our comprehensive documentation, tutorials, and troubleshooting guides",
      features: ["500+ Articles", "Step-by-step guides", "API References", "Best Practices"],
      buttonText: "Explore Documentation",
      buttonVariant: "secondary",
      popular: false
    },
    {
      icon: "💬",
      title: "Community Forum",
      description: "Connect with thousands of developers, share solutions, and get community support",
      features: ["50K+ Developers", "Active Discussions", "Code Sharing", "Peer Reviews"],
      buttonText: "Join Community",
      buttonVariant: "secondary",
      popular: true
    },
    {
      icon: "🎥",
      title: "Video Tutorials",
      description: "Watch step-by-step video guides, webinars, and expert-led training sessions",
      features: ["100+ Videos", "Live Webinars", "Expert Sessions", "Project Walkthroughs"],
      buttonText: "Watch Videos",
      buttonVariant: "secondary",
      popular: false
    },
    {
      icon: "🔧",
      title: "Technical Support",
      description: "Get direct help from our expert support team for complex issues and custom solutions",
      features: ["24/7 Support", "Expert Engineers", "Priority Response", "Custom Solutions"],
      buttonText: "Contact Support",
      buttonVariant: "primary",
      popular: false
    },
    {
      icon: "🚀",
      title: "API Playground",
      description: "Test and experiment with our APIs in a live sandbox environment",
      features: ["Live Testing", "Code Generation", "Interactive Docs", "Quick Start"],
      buttonText: "Try Playground",
      buttonVariant: "secondary",
      popular: false
    },
    {
      icon: "📋",
      title: "Status Page",
      description: "Check real-time system status, incident reports, and maintenance schedules",
      features: ["Live Status", "Incident History", "Performance Metrics", "Subscribe to Updates"],
      buttonText: "View Status",
      buttonVariant: "secondary",
      popular: false
    }
  ]

  const faqs = [
    {
      question: "How quickly can I expect a response from technical support?",
      answer: "Our standard response time is within 2 hours for priority issues and 24 hours for general inquiries. Enterprise customers receive 1-hour response times."
    },
    {
      question: "Do you offer dedicated support for enterprise customers?",
      answer: "Yes, we offer dedicated support engineers, SLAs with 99.9% uptime guarantee, and custom training sessions for enterprise customers."
    },
    {
      question: "Can I get help with device integration and setup?",
      answer: "Absolutely! Our support team specializes in device integration and can provide step-by-step guidance for connecting any IoT device to our platform."
    },
    {
      question: "What resources are available for learning the platform?",
      answer: "We offer comprehensive documentation, video tutorials, interactive API playground, weekly webinars, and a community forum with 50,000+ developers."
    }
  ]

  const supportStats = [
    { number: "98%", label: "Customer Satisfaction" },
    { number: "<2h", label: "Average Response Time" },
    { number: "24/7", label: "Support Availability" },
    { number: "50K+", label: "Community Members" }
  ]

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="page-hero-content">
            <h1>Support Center</h1>
            <p>Get the help you need to succeed with IoTConnect. Our comprehensive support resources and expert team are here for you.</p>
            <div className="support-stats">
              {supportStats.map((stat, index) => (
                <div key={index} className="support-stat">
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="support">
        <div className="container">
          <div className="support-header">
            <h2>How Can We Help You Today?</h2>
            <p>Choose from our comprehensive support options designed to get you the help you need, when you need it.</p>
          </div>

          <div className="support-options">
            {supportOptions.map((option, index) => (
              <div key={index} className={`support-card ${option.popular ? 'popular' : ''}`}>
                {option.popular && <div className="popular-badge">Most Popular</div>}
                <div className="support-card-header">
                  <div className="support-icon">
                    <span>{option.icon}</span>
                  </div>
                  <h3>{option.title}</h3>
                </div>
                <p className="support-description">{option.description}</p>
                <ul className="support-features">
                  {option.features.map((feature, featureIndex) => (
                    <li key={featureIndex}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className={`btn btn-${option.buttonVariant} support-btn`}>
                  {option.buttonText}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="faq-section">
        <div className="container">
          <div className="faq-header">
            <h2>Frequently Asked Questions</h2>
            <p>Quick answers to common questions about our support services</p>
          </div>
          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <div className="faq-question">
                  <h4>{faq.question}</h4>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="support-cta">
        <div className="container">
          <div className="cta-content">
            <div className="cta-text">
              <h2>Still Need Help?</h2>
              <p>Our dedicated support team is ready to assist you with any questions or challenges you're facing.</p>
              <div className="cta-features">
                <div className="cta-feature">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>24/7 Support Availability</span>
                </div>
                <div className="cta-feature">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Expert IoT Engineers</span>
                </div>
                <div className="cta-feature">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Guaranteed Response Times</span>
                </div>
              </div>
            </div>
            <div className="cta-actions">
              <button className="btn btn-primary btn-large">
                Contact Support Team
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="btn btn-secondary">
                Schedule a Call
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}