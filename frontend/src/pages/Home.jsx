import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getElections } from '../services/electionService.js';
import { useAuth } from '../context/AuthContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Icon from '../components/Icon.jsx';
import { formatDate } from '../utils/format.js';

const FEATURES = [
  { icon: 'shield', title: 'Secure & private', text: 'Ballots are stored anonymously, so your individual vote can never be traced back to you.' },
  { icon: 'check', title: 'Transparent results', text: 'Aggregated tallies are published as soon as an election closes or an administrator releases them.' },
  { icon: 'users', title: 'Easy participation', text: 'Register once, then vote in every open election from any device.' },
];

const STEPS = [
  { title: 'Register', text: 'Create your voter account with your registration number.' },
  { title: 'Choose an election', text: 'Browse active elections and review the candidates.' },
  { title: 'Cast your vote', text: 'Select a candidate, confirm, and submit — once per election.' },
];

function Home() {
  const { isAuthenticated } = useAuth();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getElections()
      .then(({ data }) => setElections(data.data || []))
      .catch(() => setElections([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <header className="hero">
        <div className="container hero-content">
          <span className="hero-badge">Secure online voting</span>
          <h1 className="hero-title">Every vote counts. Make yours heard.</h1>
          <p className="hero-subtitle">
            A transparent, easy-to-use platform for running elections — register, browse
            candidates, cast your vote, and follow results in real time.
          </p>
          <div className="hero-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-on-dark btn-lg">
                <Icon name="dashboard" /> Go to dashboard
              </Link>
            ) : (
              <Link to="/register" className="btn btn-on-dark btn-lg">
                Register to vote
              </Link>
            )}
            <Link to="/elections" className="btn btn-ghost-on-dark btn-lg">
              Browse elections
            </Link>
          </div>
        </div>
      </header>

      <section className="section" id="how-it-works">
        <div className="container">
          <h2 className="section-title">How voting works</h2>
          <p className="section-subtitle">Three simple steps from registration to a recorded ballot.</p>
          <div className="steps">
            {STEPS.map((s, i) => (
              <div className="step" key={s.title}>
                <div className="step-num">{i + 1}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">Why E-Voting?</h2>
          <p className="section-subtitle">Built for trust, clarity, and participation.</p>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">
                  <Icon name={f.icon} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Available elections</h2>
          <p className="section-subtitle">A preview of the latest elections on the platform.</p>

          {loading ? (
            <div className="spinner-page">
              <span className="spinner" />
            </div>
          ) : elections.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Icon name="election" />
              </div>
              <h3>No elections yet</h3>
              <p>Check back soon — new elections will appear here.</p>
            </div>
          ) : (
            <div className="election-grid">
              {elections.slice(0, 6).map((e) => (
                <div className="election-card" key={e._id}>
                  <div>
                    <StatusBadge status={e.status} />
                  </div>
                  <h3>{e.title}</h3>
                  {e.description && <p className="election-desc">{e.description}</p>}
                  <div className="election-meta">
                    <span>
                      <Icon name="calendar" size={14} /> {formatDate(e.startDate)} → {formatDate(e.endDate)}
                    </span>
                  </div>
                  <div className="election-footer">
                    <Link to={`/elections/${e._id}`} className="btn btn-outline btn-sm">
                      View details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta">
            <h2>Ready to make your voice count?</h2>
            <p>Join the platform and participate in the next election.</p>
            {isAuthenticated ? (
              <Link to="/elections" className="btn btn-on-dark btn-lg">Find an election</Link>
            ) : (
              <Link to="/register" className="btn btn-on-dark btn-lg">Create your account</Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
