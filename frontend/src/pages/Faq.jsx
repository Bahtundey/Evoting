import StaticPage from '../components/StaticPage.jsx';

const FAQ = [
  {
    q: 'How do I register to vote?',
    a: 'Create an account from the registration page with your name, email, registration number, and a password. After registering, log in to vote.',
  },
  {
    q: 'How many times can I vote?',
    a: 'Once per election. The system records your participation and rejects any second attempt in the same election.',
  },
  {
    q: 'When are results published?',
    a: 'Results become visible when an election completes, or earlier if an administrator publishes them.',
  },
  {
    q: 'Is my vote secret?',
    a: 'Ballots are stored without any link to your identity. Published results are aggregates only — no individual ballot choices are shown.',
  },
  {
    q: 'I forgot my password. What can I do?',
    a: 'Contact your platform administrator for assistance.',
  },
];

export default function Faq() {
  return (
    <StaticPage
      title="Frequently asked questions"
      subtitle="Common questions about voting on the platform"
    >
      {FAQ.map((item) => (
        <div key={item.q} className="faq-item">
          <h3>{item.q}</h3>
          <p>{item.a}</p>
        </div>
      ))}
    </StaticPage>
  );
}
