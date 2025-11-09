export default function Products() {
  const products = [
    {
      id: 1,
      name: "IoT Core Platform",
      description: "Central hub for device management and data processing",
      features: ["Device Management", "Data Ingestion", "Real-time Monitoring"],
      price: "$99/month"
    },
    {
      id: 2,
      name: "Analytics Suite",
      description: "Advanced analytics and machine learning capabilities",
      features: ["Predictive Analytics", "Custom Dashboards", "AI Insights"],
      price: "$149/month"
    },
    {
      id: 3,
      name: "Security Module",
      description: "End-to-end security for your IoT ecosystem",
      features: ["Encryption", "Access Control", "Threat Detection"],
      price: "$79/month"
    }
  ]

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Our Products</h1>
          <p>Comprehensive IoT solutions for every need</p>
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
                <button className="btn-primary">Get Started</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}