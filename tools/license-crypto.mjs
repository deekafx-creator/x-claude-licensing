// Shared licence-token helpers.
// Token format: XCL1.<base64url(payload-json)>.<base64url(ed25519-signature)>
// The signature covers the ASCII text "XCL1.<payload>", exactly like a JWT.
import crypto from 'node:crypto';

export const TOKEN_PREFIX = 'XCL1';

export function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function sha256Hex(text) {
  return crypto.createHash('sha256').update(String(text), 'utf8').digest('hex');
}

// Deterministic JSON: sorted keys, no whitespace. Signing and later
// verification must agree byte-for-byte, so never sign pretty-printed JSON.
export function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  return `{${Object.keys(value)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`)
    .join(',')}}`;
}

export function signPayload(payload, privateKeyPem) {
  const payloadPart = base64url(Buffer.from(canonicalJson(payload), 'utf8'));
  const signingInput = `${TOKEN_PREFIX}.${payloadPart}`;
  const signature = crypto.sign(null, Buffer.from(signingInput, 'utf8'), privateKeyPem);
  return `${signingInput}.${base64url(signature)}`;
}

export function normalizeLicenceId(text) {
  return String(text || '').trim().toUpperCase();
}

export function licenceHash(licenceId) {
  return sha256Hex(normalizeLicenceId(licenceId));
}
