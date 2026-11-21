// Integration test for the E-Voting Platform API.
//
// PREREQUISITES: the backend must be running (`npm run dev`) and an admin
// account must be seeded (`npm run seed:admin`). Configure with:
//   API_URL         (default http://localhost:5050/api)
//   ADMIN_EMAIL     (default admin@evoting.local)
//   ADMIN_PASSWORD  (default AdminPass123!)
//
// Run from the backend directory:  npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';

const BASE = process.env.API_URL || 'http://localhost:5050/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@evoting.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminPass123!';

async function req(method, path, { token, body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* empty body */
  }
  return { status: res.status, json };
}

const iso = (offsetDays) => new Date(Date.now() + offsetDays * 86400000).toISOString();

test('GET /api/health returns 200 and connected database', async () => {
  const r = await req('GET', '/health');
  assert.equal(r.status, 200);
  assert.equal(r.json.success, true);
  assert.equal(r.json.data.database, 'connected');
});

test('authentication and validation', async () => {
  const stamp = Date.now();
  const email = `auth-${stamp}@test.com`;
  const reg = `AUTH-${stamp}`;

  // register
  let r = await req('POST', '/auth/register', {
    body: { fullName: 'Auth Tester', email, password: 'secret123', registrationNumber: reg },
  });
  assert.equal(r.status, 201);
  assert.equal(r.json.data.user.role, 'voter');
  assert.equal(r.json.data.token, undefined, 'registration must not return a token');
  assert.ok(!('password' in r.json.data.user), 'password hash must not be returned');

  // log in to obtain a token
  r = await req('POST', '/auth/login', { body: { email, password: 'secret123' } });
  assert.equal(r.status, 200);
  const token = r.json.data.token;

  // duplicate email -> 409
  r = await req('POST', '/auth/register', {
    body: { fullName: 'Dup', email, password: 'secret123', registrationNumber: `DUP-${stamp}` },
  });
  assert.equal(r.status, 409);

  // duplicate registration number -> 409
  r = await req('POST', '/auth/register', {
    body: { fullName: 'Dup', email: `dup-${stamp}@test.com`, password: 'secret123', registrationNumber: reg },
  });
  assert.equal(r.status, 409);

  // short password -> 400
  r = await req('POST', '/auth/register', {
    body: { fullName: 'X', email: `x-${stamp}@test.com`, password: '123', registrationNumber: `X-${stamp}` },
  });
  assert.equal(r.status, 400);

  // invalid login -> 401
  r = await req('POST', '/auth/login', { body: { email, password: 'wrongpass' } });
  assert.equal(r.status, 401);

  // /me with token -> 200, without token -> 401
  r = await req('GET', '/auth/me', { token });
  assert.equal(r.status, 200);
  assert.equal(r.json.data.email, email);
  r = await req('GET', '/auth/me');
  assert.equal(r.status, 401);

  // public registration cannot create an admin
  r = await req('POST', '/auth/register', {
    body: { fullName: 'Sneaky', email: `sneaky-${stamp}@test.com`, password: 'secret123', registrationNumber: `SN-${stamp}`, role: 'admin' },
  });
  assert.equal(r.status, 201);
  assert.equal(r.json.data.user.role, 'voter', 'role must be forced to voter');
});

test('complete voting workflow with duplicate + concurrency protection', async () => {
  const stamp = Date.now();

  // admin login
  let r = await req('POST', '/auth/login', { body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
  assert.equal(r.status, 200, 'admin must be seeded first (npm run seed:admin)');
  assert.equal(r.json.data.user.role, 'admin');
  const adminToken = r.json.data.token;

  // register two voters (registration returns no token), then log in
  const voter1Email = `v1-${stamp}@test.com`;
  r = await req('POST', '/auth/register', {
    body: { fullName: 'Voter One', email: voter1Email, password: 'secret123', registrationNumber: `V1-${stamp}` },
  });
  assert.equal(r.status, 201);
  r = await req('POST', '/auth/login', { body: { email: voter1Email, password: 'secret123' } });
  const voter1Token = r.json.data.token;

  const voter2Email = `v2-${stamp}@test.com`;
  r = await req('POST', '/auth/register', {
    body: { fullName: 'Voter Two', email: voter2Email, password: 'secret123', registrationNumber: `V2-${stamp}` },
  });
  assert.equal(r.status, 201);
  r = await req('POST', '/auth/login', { body: { email: voter2Email, password: 'secret123' } });
  const voter2Token = r.json.data.token;

  // create an active election
  r = await req('POST', '/elections', {
    token: adminToken,
    body: { title: `Integration Election ${stamp}`, startDate: iso(-1), endDate: iso(1) },
  });
  assert.equal(r.status, 201);
  assert.equal(r.json.data.status, 'active');
  const electionId = r.json.data._id;

  // create candidates
  r = await req('POST', '/candidates', {
    token: adminToken,
    body: { fullName: 'Candidate Alpha', party: 'Alpha Party', election: electionId },
  });
  assert.equal(r.status, 201);
  const candA = r.json.data._id;
  r = await req('POST', '/candidates', {
    token: adminToken,
    body: { fullName: 'Candidate Beta', party: 'Beta Party', election: electionId },
  });
  const candB = r.json.data._id;

  // view candidates
  r = await req('GET', `/candidates?election=${electionId}`);
  assert.equal(r.status, 200);
  assert.equal(r.json.data.length, 2);

  // voter 1 votes
  r = await req('POST', '/votes', { token: voter1Token, body: { election: electionId, candidate: candA } });
  assert.equal(r.status, 201, 'first vote should succeed');

  // duplicate vote rejected
  r = await req('POST', '/votes', { token: voter1Token, body: { election: electionId, candidate: candB } });
  assert.equal(r.status, 409, 'duplicate vote must be rejected');

  // concurrency: voter 2 fires 6 simultaneous votes, exactly one succeeds
  const N = 6;
  const attempts = await Promise.all(
    Array.from({ length: N }, () =>
      req('POST', '/votes', { token: voter2Token, body: { election: electionId, candidate: candB } })
    )
  );
  const created = attempts.filter((x) => x.status === 201).length;
  const dup = attempts.filter((x) => x.status === 409).length;
  assert.equal(created, 1, 'exactly one concurrent vote should be recorded');
  assert.equal(dup, N - 1, 'remaining concurrent votes must be rejected');

  // admin cannot vote
  r = await req('POST', '/votes', { token: adminToken, body: { election: electionId, candidate: candA } });
  assert.equal(r.status, 403, 'admins cannot cast votes');

  // results hidden before publish (still active)
  r = await req('GET', `/votes/results/${electionId}`);
  assert.equal(r.status, 403, 'results must be hidden before publish');

  // complete the election and publish results
  r = await req('PUT', `/elections/${electionId}`, {
    token: adminToken,
    body: { status: 'completed', resultsPublished: true },
  });
  assert.equal(r.status, 200);

  // verify aggregated results
  r = await req('GET', `/votes/results/${electionId}`);
  assert.equal(r.status, 200);
  const data = r.json.data;
  assert.equal(data.election.totalVotes, 2, 'total votes must be 2');
  const alpha = data.results.find((x) => x.candidateId === candA);
  const beta = data.results.find((x) => x.candidateId === candB);
  assert.equal(alpha.votes, 1);
  assert.equal(beta.votes, 1);
  assert.equal(Math.round((alpha.percentage + beta.percentage) * 100) / 100, 100, 'percentages sum to 100');

  // ballot secrecy: no voter identity in the results payload
  const payload = JSON.stringify(data);
  assert.ok(!payload.includes(voter1Email), 'voter1 identity must not leak');
  assert.ok(!payload.includes(voter2Email), 'voter2 identity must not leak');
});
