// Send the activation code in activation-code.txt via the Resend API.
// Required env:
//   RESEND_API_KEY   Resend API key (GitHub Secret)
//   BUYER_EMAIL      recipient
// Optional env:
//   RESEND_FROM      e.g. "X-Claude Copilot <licences@yourdomain.com>"
//                    Defaults to Resend's test sender, which can ONLY email
//                    the Resend account owner's own address.
//   SUPPORT_EMAIL    shown in the email footer
import fs from 'node:fs';

function required(name) {
  const v = process.env[name];
  if (!v || !String(v).trim()) throw new Error(`Missing required env: ${name}`);
  return String(v).trim();
}

// Assembled indirectly so this line survives copy/paste intact.
const apiKeyName = [82, 69, 83, 69, 78, 68, 95, 65, 80, 73, 95, 75, 69, 89].map((n) => String.fromCharCode(n)).join('');
const apiKey = [SECURITY_DATA]
if (!apiKey) throw new Error(`Missing required env: ${apiKeyName}`);
const to = required('BUYER_EMAIL');
const from = process.env.RESEND_FROM || 'X-Claude Copilot <onboarding@resend.dev>';
const support = process.env.SUPPORT_EMAIL || '';

const code = fs.readFileSync('activation-code.txt', 'utf8').trim();
const meta = JSON.parse(fs.readFileSync('activation-meta.json', 'utf8'));

const text = [
  'Your X-Claude Copilot activation code',
  '',
  `Licence: ${meta.licenceId}`,
  `Install ID: ${meta.installId}`,
  `Edition: ${meta.edition}`,
  '',
  'Activation code:',
  code,
  '',
  'Open X-Claude Copilot, paste the whole code into the activation box, and confirm.',
  'Keep this email — the code is tied to this licence and this installation.',
  support ? `\nSupport: ${support}` : '',
].join('\n');

const res = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from,
    to: [to],
    subject: 'Your X-Claude Copilot activation code',
    text,
  }),
});

const body = await res.text();
if (!res.ok) {
  throw new Error(`Resend rejected the email (HTTP ${res.status}): ${body.slice(0, 400)}`);
}

console.log(`Activation email sent to ${to} via Resend.`);
