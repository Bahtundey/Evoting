import StaticPage from '../components/StaticPage.jsx';

export default function VotingGuidelines() {
  return (
    <StaticPage title="Voting guidelines" subtitle="How to cast a valid vote">
      <ul>
        <li>Review every candidate&apos;s profile and biography before choosing.</li>
        <li>You may vote once per election; a submitted vote cannot be changed.</li>
        <li>Voting is only available while an election is marked active.</li>
        <li>Confirm your selection on the review screen before submitting.</li>
        <li>If you believe you are eligible but cannot vote, contact the administrator.</li>
      </ul>
    </StaticPage>
  );
}
