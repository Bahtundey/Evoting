import StaticPage from '../components/StaticPage.jsx';
import config from '../config.js';

export default function About() {
  return (
    <StaticPage title="About" subtitle={`About ${config.appName}`}>
      <p>
        {config.appName} is a web application for running elections online. Voters register,
        review candidates, cast a single ballot per election, and view published results.
        Administrators manage elections, candidates, and voter accounts from a dedicated
        dashboard.
      </p>
      <p>
        The platform is built around a few core principles: ballots are stored anonymously so
        individual choices cannot be traced back to voters, results are aggregated and only
        shown once published, and authorization is enforced on the server for every protected
        action.
      </p>
    </StaticPage>
  );
}
