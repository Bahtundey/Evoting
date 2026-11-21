/**
 * Creates the initial administrator account from environment variables.
 * Safe to run more than once (idempotent).
 *
 * Required environment variables (set in backend/.env):
 *   ADMIN_NAME     — administrator's full name
 *   ADMIN_EMAIL    — administrator's login email
 *   ADMIN_PASSWORD — administrator's password (bcrypt-hashed before saving)
 *
 * Usage:
 *   npm run create-admin
 *   # or directly:
 *   node scripts/createAdmin.js
 *
 * The admin role is assigned here on the backend; public registration can
 * never create an admin. Credentials live in .env and are never committed.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

const createAdmin = async () => {
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error(
      'Missing admin configuration. Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env'
    );
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  // Backward-compatible migration: users created before the role field existed
  // default to voter. Never promotes an existing account to admin here.
  const migrated = await User.updateMany(
    { role: { $exists: false } },
    { $set: { role: 'voter' } }
  );
  if (migrated.modifiedCount > 0) {
    console.log(`Migrated ${migrated.modifiedCount} user(s) to role=voter`);
  }

  const email = ADMIN_EMAIL.trim().toLowerCase();
  const existing = await User.findOne({ email });

  if (existing) {
    // Idempotent re-run: ensure the account is an active admin, leave the
    // password unchanged.
    if (existing.role !== 'admin' || !existing.isActive) {
      existing.role = 'admin';
      existing.isActive = true;
      await existing.save();
    }
    console.log(`Admin already exists: ${existing.email} (role=${existing.role})`);
  } else {
    // User.create() triggers the pre-save hook, so the password is hashed.
    const admin = await User.create({
      fullName: ADMIN_NAME.trim(),
      email,
      password: ADMIN_PASSWORD,
      registrationNumber: `ADMIN-${Date.now()}`,
      role: 'admin',
      isActive: true,
    });
    console.log(`Admin created: ${admin.email} (role=${admin.role})`);
  }

  await mongoose.connection.close();
  process.exit(0);
};

createAdmin().catch((error) => {
  console.error('Failed to create admin:', error.message);
  process.exit(1);
});
