// Generate the Ed25519 signing key pair for the licence system.
// Run locally (Node 18+):  node tools/generate-keypair.mjs
//
// Output:
//   licence-private-key.pem  -> SECRET. Put it in GitHub as the
//                               LICENCE_SIGNING_PRIVATE_KEY secret, then
//                               DELETE the local file. Never commit it.
//   licence-public-key.pem   -> safe to commit in this repository. It will
//                               later be embedded in the extension so it
//                               can verify activation codes offline.
import crypto from 'node:crypto';
import fs from 'node:fs';

const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');

const privPem = privateKey.export({ type: 'pkcs8', format: 'pem' });
const pubPem = publicKey.export({ type: 'spki', format: 'pem' });

if (fs.existsSync('licence-private-key.pem') || fs.existsSync('licence-public-key.pem')) {
  console.error('Key files already exist here — refusing to overwrite them.');
  console.error('Move them aside first if you really want a NEW key pair.');
  console.error('WARNING: a new key pair invalidates every activation code already issued.');
  process.exit(1);
}

fs.writeFileSync('licence-private-key.pem', privPem, { mode: 0o600 });
fs.writeFileSync('licence-public-key.pem', pubPem);

console.log('Created licence-private-key.pem  (SECRET — upload to GitHub Secrets, then delete)');
console.log('Created licence-public-key.pem   (commit this one in the repository)');
