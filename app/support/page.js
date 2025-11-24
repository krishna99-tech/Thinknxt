import { hr } from "framer-motion/client"
import { href } from "react-router-dom"

export default function Support() {
  const supportOptions = [
    {
      icon: "📚",
      title: "Documentation",
      description: "Access comprehensive guides for IoT integration, real-time data collection, and device control",
      features: ["Integration Guides", "API Documentation", "Code Examples", "Best Practices"],
      buttonText: "View Docs",
      buttonVariant: "secondary",
      popular: false
    },
    {
      icon: "💬",
      title: "Community Forum",
      description: "Connect with IoT developers, share solutions, and get support from the ThingsNXT community",
      features: ["Active Discussions", "Expert Members", "Code Sharing", "Solution Sharing"],
      buttonText: "Join Forum",
      buttonVariant: "secondary",
      popular: true
    },
    {
      icon: "🎥",
      title: "Video Tutorials",
      description: "Watch step-by-step guides for device integration and platform features",
      features: ["Integration Tutorials", "Live Webinars", "Expert Sessions", "Case Studies"],
      buttonText: "Watch Now",
      buttonVariant: "secondary",
      popular: false
    },
    {
      icon: "🔧",
      title: "Technical Support",
      description: "Get direct assistance from ThingsNXT engineers for implementation and troubleshooting",
      features: ["24/7 Support", "Expert Engineers", "Priority Response", "Custom Solutions"],
      buttonText: "Contact Support",
      buttonVariant: "secondary",
      popular: false
    },
    {
      icon: "📱",
      title: "Mobile App Support",
      description: "Get help with ThingsNXT Android and iOS mobile applications",
      features: ["App Guides", "Installation Help", "Feature Tutorials", "Troubleshooting"],
      buttonText: "Mobile Support",
      buttonVariant: "secondary",
      popular: false
    },
    {
      icon: "📋",
      title: "Status & Updates",
      description: "Check platform status, maintenance schedules, and feature updates",
      features: ["Live Status", "Incident Reports", "Performance Metrics", "Release Notes"],
      buttonText: "View Status",
      buttonVariant: "secondary",
      popular: false
    }
  ]

  const faqs = [
    {
      question: "How do I integrate IoT devices with ThingsNXT?",
      answer: "ThingsNXT supports multiple protocols including MQTT, HTTP, WebSocket, and CoAP. Check our integration guides for device-specific setup instructions, or contact our support team for custom integration assistance."
    },
    {
      question: "What is the real-time data latency?",
      answer: "ThingsNXT platform ensures sub-second latency for real-time data collection. Most devices report data within 100-500ms depending on your network connection and device configuration."
    },
    {
      question: "Can I control smart devices remotely?",
      answer: "Yes! ThingsNXT provides a unified dashboard and REST API for remote device control. You can send commands, schedule automations, and create device groups for batch operations."
    },
    {
      question: "Is there an Android app available?",
      answer: "Yes, ThingsNXT Android app is available on Google Play Store. It offers real-time device monitoring, control capabilities, and push notifications for your IoT ecosystem."
    },
    {
      question: "What security features does ThingsNXT provide?",
      answer: "We provide end-to-end encryption, OAuth 2.0 authentication, API key management, role-based access control, and audit logging to ensure your IoT data is secure."
    },
    {
      question: "How do I get help with platform features?",
      answer: "Access our comprehensive documentation, video tutorials, community forum, or contact our 24/7 support team. Enterprise customers receive dedicated support engineers."
    }
  ]

  const supportStats = [
    { number: "99%", label: "Uptime" },
    { number: "<500ms", label: "Data Latency" },
    { number: "24/7", label: "Support" },
    { number: "10K+", label: "Active Users" }
  ]

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="page-hero-content">
            <h1>ThingsNXT Support</h1>
            <p>Expert help for your IoT integration needs. Real-time data collection, device control, and platform support.</p>
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
            <h2>How Can We Help You?</h2>
            <p>Choose your preferred support channel for IoT integration and platform assistance.</p>
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
                    <li key={featureIndex}>✓ {feature}</li>
                  ))}
                </ul>
                <button className={`btn btn-${option.buttonVariant} support-btn`}>
                  {option.buttonText}
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
            <p>Quick answers about ThingsNXT IoT platform</p>
          </div>
          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <div className="faq-question">
                  <h4>{faq.question}</h4>
                </div>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}