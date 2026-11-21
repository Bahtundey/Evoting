import { Link } from 'react-router-dom';
import config from '../config.js';

export default function Footer() {
  const year = new Date().getFullYear();
  const { contactEmail, socialLinks } = config;

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col footer-brand-col">
            <div className="footer-brand">{config.appName}</div>
            <p className="footer-text">{config.description}</p>
            <p className="footer-text">{config.tagline}</p>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Quick links</h4>
            <ul className="footer-list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/elections">Elections</Link></li>
              <li><Link to="/results">Results</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Voter resources</h4>
            <ul className="footer-list">
              <li><a href="/#how-it-works">How voting works</a></li>
              <li><Link to="/register">Voter registration</Link></li>
              <li><Link to="/faq">Frequently asked questions</Link></li>
              <li><Link to="/voting-guidelines">Voting guidelines</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Contact</h4>
            {contactEmail ? (
              <p className="footer-text">
                <a href={`mailto:${contactEmail}`} className="footer-link">{contactEmail}</a>
              </p>
            ) : (
              <p className="footer-text">
                <Link to="/contact" className="footer-link">Contact support</Link>
              </p>
            )}
            {socialLinks.length > 0 && (
              <div className="footer-social">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    className="footer-social-link"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} {config.appName}. All rights reserved.</span>
          <div className="footer-legal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
