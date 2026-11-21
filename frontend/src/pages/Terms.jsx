import StaticPage from '../components/StaticPage.jsx';
import config from '../config.js';

export default function Terms() {
  return (
    <StaticPage title="Terms & Conditions" subtitle="Platform terms of use">
      <p>
        <em>
          This is a placeholder agreement for the {config.appName} demonstration project.
          Replace it with real terms before any production use.
        </em>
      </p>
      <p>
        By using the platform you agree to vote once per election and to provide accurate
        registration details. Administrators may deactivate accounts that misuse the service.
      </p>
    </StaticPage>
  );
}
