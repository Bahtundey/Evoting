// Centralized application configuration. Branding and contact details live
// here so they aren't duplicated (or hardcoded) across components.
const config = {
  appName: 'E-Voting Platform',
  brandName: 'E-Voting',
  tagline: 'Secure, transparent online elections.',
  description:
    'A platform for running elections online — register, review candidates, cast your vote, and follow results transparently.',
  // Contact email from environment config (VITE_CONTACT_EMAIL). Leave empty
  // to omit the address rather than display a fake one.
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || '',
  // Optional social links. Add objects like { label: 'Twitter', url: '...' }
  // only when a real, valid account exists. Empty = the section is hidden.
  socialLinks: [],
};

export default config;
