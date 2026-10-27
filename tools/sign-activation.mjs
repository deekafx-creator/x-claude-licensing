// Create one signed activation code and write it to activation-code.txt
// (the workflow emails that file with Resend, then deletes it).
// The code is never printed to the workflow log.
//
// Required env:
//   LICENCE_SIGNING_PRIVATE_KEY  PEM contents of the Ed25519 private key
//   BUYER_EMAIL                  delivery address (hashed into the token)
//   LICENCE_ID                   e.g. XC-2026-0001
//   INSTALL_ID                   install/request ID shown by the extension
//   EDITION                      e.g. pro
//   DURATION_DAYS                e.g. 365 (0 = no expiry)
import crypto from 'node:crypto';
import fs from 'node:fs';
import { signPayload, sha256Hex, normalizeLicenceId, licenceHash } from './license-crypto.mjs';

function required(name) {
  const v = process.env[name];
  if (!v || !String(v).trim()) throw new Error(`Missing required env: ${name}`);
  return String(v).trim();
}

const privateKey = required('LICENCE_SIGNING_PRIVATE_KEY');
const buyerEmail = required('BUYER_EMAIL').toLowerCase();
const licenceId = normalizeLicenceId(required('LICENCE_ID'));
const installId = required('INSTALL_ID');
const edition = (process.env.EDITION || 'pro').trim();
const days = Number(process.env.DURATION_DAYS || 365);

const now = Math.floor(Date.now() / 1000);
const payload = {
  v: 1,
  typ: 'activation',
  licenceId,
  licenceHash: licenceHash(licenceId),
  emailHash: sha256Hex(buyerEmail),
  installId,
  edition,
  iat: now,
  exp: Number.isFinite(days) && days > 0 ? now + Math.floor(days) * 86400 : 0,
  jti: crypto.randomUUID(),
};

const token = signPayload(payload, privateKey);
fs.writeFileSync('activation-code.txt', token + '\n', { mode: 0o600 });

// Metadata for the email step. No secrets and NOT the token.
fs.writeFileSync(
  'activation-meta.json',
  JSON.stringify({ licenceId, installId, edition, durationDays: days }, null, 2) + '\n'
);

console.log(`Activation code generated for licence ${licenceId} (not printed here by design).`);
