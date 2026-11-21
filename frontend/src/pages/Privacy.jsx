import StaticPage from '../components/StaticPage.jsx';
import config from '../config.js';

export default function Privacy() {
  return (
    <StaticPage title="Privacy Policy" subtitle="How your information is handled">
      <p>
        <em>
          This is a placeholder policy for the {config.appName} demonstration project. Replace
          it with a real privacy policy before any production use.
        </em>
      </p>
      <p>
        Accounts store the information you provide at registration (name, email, and
        registration number). Passwords are stored as hashes, never in plain text. Ballots are
        recorded anonymously and are not linked to your identity in any published result.
      </p>
    </StaticPage>
  );
}
