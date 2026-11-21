import StaticPage from '../components/StaticPage.jsx';
import config from '../config.js';

export default function Contact() {
  return (
    <StaticPage title="Contact" subtitle="Get in touch">
      {config.contactEmail ? (
        <p>
          For support or questions, email us at{' '}
          <a href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a>.
        </p>
      ) : (
        <p>
          Contact details are not configured yet. Ask your platform administrator for the
          support address.
        </p>
      )}
      <p>Support is provided by the platform administrator.</p>
    </StaticPage>
  );
}
