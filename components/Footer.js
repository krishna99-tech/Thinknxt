import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>IoTConnect</h3>
            <p>Connecting your world through intelligent IoT solutions.</p>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <Link href="/products">Products</Link>
            <Link href="/documentation">Documentation</Link>
            <Link href="/support">Support</Link>
            <Link href="/contact">Contact</Link>
          </div>
          
          <div className="footer-section">
            <h4>Contact Info</h4>
            <p>Email: info@iotconnect.com</p>
            <p>Phone: +1 (555) 123-4567</p>
            <p>Address: 123 Tech Park, Silicon Valley</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 IoTConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}