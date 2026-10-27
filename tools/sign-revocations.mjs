// Build + sign revocations.json from revoked-licences.txt.
// Each non-comment line may be either a raw licence ID (hashed here, so raw
// IDs are never published) or a ready-made "sha256:<64 hex>" licence hash.
//
// Required env: LICENCE_SIGNING_PRIVATE_KEY
// Optional env: REVOCATIONS_VERSION (defaults to current unix time)
import fs from 'node:fs';
import { signPayload, licenceHash } from './license-crypto.mjs';

const privateKey = process.env.LICENCE_SIGNING_PRIVATE_KEY;
if (!privateKey) throw new Error('Missing LICENCE_SIGNING_PRIVATE_KEY');

const hashes = new Set();
for (const rawLine of fs.readFileSync('revoked-licences.txt', 'utf8').split(/\r?\n/)) {
  const line = rawLine.trim();
  if (!line || line.startsWith('#')) continue;
  if (/^sha256:[0-9a-f]{64}$/i.test(line)) hashes.add(line.slice(7).toLowerCase());
  else hashes.add(licenceHash(line));
}

const payload = {
  v: 1,
  typ: 'revocations',
  version: Number(process.env.REVOCATIONS_VERSION || Math.floor(Date.now() / 1000)),
  revoked: [...hashes].sort(),
};

const token = signPayload(payload, privateKey);
const out = { ...payload, token };
fs.writeFileSync('revocations.json', JSON.stringify(out, null, 2) + '\n');
console.log(`revocations.json signed: ${payload.revoked.length} revoked licence(s), version ${payload.version}.`);
