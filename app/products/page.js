export default function Products() {
  const products = [
    {
      id: 1,
      name: "Real-Time Data Collection",
      description: "Collect and process IoT sensor data in real-time with zero latency",
      features: ["Live Data Streaming", "Multi-Protocol Support", "Data Aggregation", "Instant Alerts"],
      price: "$99/month"
    },
    {
      id: 2,
      name: "Smart Device Control",
      description: "Monitor and control connected devices from a unified dashboard",
      features: ["Remote Device Management", "Command Scheduling", "Device Groups", "Action Automation"],
      price: "$149/month"
    },
    {
      id: 3,
      name: "IoT Analytics & Intelligence",
      description: "Advanced analytics and machine learning for IoT data insights",
      features: ["Predictive Analytics", "Custom Reports", "AI Pattern Detection", "Trend Analysis"],
      price: "$199/month"
    },
    {
      id: 4,
      name: "Enterprise Integration",
      description: "Seamless integration with existing enterprise systems and APIs",
      features: ["Custom API Access", "Webhook Support", "Database Sync", "ERP Integration"],
      price: "$299/month"
    }
  ]

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>ThingsNXT Platform Features</h1>
          <p>Comprehensive IoT solutions for real-time data collection and smart device control</p>
        </div>
      </section>

      <section className="products">
        <div className="container">
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <ul>
                  {product.features.map((feature, index) => (
                    <li key={index}>✓ {feature}</li>
                  ))}
                </ul>
                <div className="product-price">{product.price}</div>
                <button className="btn-primary">Start Free Trial</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}