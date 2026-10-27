# Setup checklist — GitHub + Resend licence system

Work top to bottom. Do not paste passwords, API keys or private keys into
any chat — keys only ever go into GitHub's own Secrets screens or Resend.

## Stage 1 — GitHub account

1. Go to github.com → Sign up. Use your Gmail address.
2. Pick a username you are happy for buyers to see (it appears in URLs).
3. Verify the email GitHub sends you.
4. Turn on two-factor authentication:
   Settings → Password and authentication → Two-factor authentication.
   Prefer an authenticator app or passkey over SMS.
5. Create the repository:
   "+" (top right) → New repository
   - Name: `x-claude-licensing`
   - Public (extensions must be able to download revocations.json without a token)
   - Do NOT add README / .gitignore / licence (this template provides them)
   - Create repository

## Stage 2 — Upload this template

1. Download and unzip `x-claude-licensing-template.zip`.
2. In the empty repository, click "uploading an existing file".
3. Drag in ALL files and folders from the unzipped template
   (including the hidden `.github` folder) and commit.

## Stage 3 — Signing key (one time)

On a computer with Node.js installed:

```bash
cd x-claude-licensing
node tools/generate-keypair.mjs
```

- Open `licence-private-key.pem`, copy the whole text.
- GitHub repo → Settings → Secrets and variables → Actions → Secrets →
  New repository secret
  - Name: `LICENCE_SIGNING_PRIVATE_KEY`
  - Value: the private key text
- DELETE `licence-private-key.pem` from the computer afterwards.
- Commit `licence-public-key.pem` in the repository (it is safe to publish).

Losing the private key means you can never issue or revoke licences again
for existing installs. Keep one offline backup on a USB stick.

## Stage 4 — Resend

1. In Resend: API Keys → Create API Key (sending access).
2. GitHub repo → Settings → Secrets and variables → Actions → Secrets:
   - `RESEND_API_KEY` = that key
3. Actions → Variables tab → New repository variable:
   - `RESEND_FROM` = `X-Claude Copilot <onboarding@resend.dev>`  (testing only)
   - `SUPPORT_EMAIL` = your Gmail (optional)

Testing sender limitation: `onboarding@resend.dev` can ONLY email the
address that owns the Resend account. That is enough for the first test.

## Stage 5 — First test email

1. Repo → Actions → "Send activation email" → Run workflow.
2. Buyer email = the Gmail that owns your Resend account.
   Licence ID = `TEST-0001`, Install ID = `TEST-INSTALL`, days = 30.
3. You should receive "Your X-Claude Copilot activation code".
4. Actions → "Sign revocations list" should also have run or be runnable —
   it produces a signed `revocations.json` and commits it back.

## Stage 6 — Your own domain (required before real buyers)

Resend will not deliver to buyers from the test sender. You need a domain
you control DNS for, e.g. `licences@yourdomain.com`.

1. Buy/register a domain (see README — free options are listed honestly).
2. Resend → Domains → Add Domain → add the domain.
3. Add every DNS record Resend shows (TXT/MX/CNAME) at your DNS host.
4. Wait for Resend to show the domain as Verified.
5. Change the GitHub variable:
   `RESEND_FROM` = `X-Claude Copilot <licences@yourdomain.com>`
6. Re-run the test workflow to your Gmail, then to a second address.

## Day-to-day use

- New sale → run "Send activation email" with the buyer's email, a fresh
  licence ID, and the install ID from their extension.
- Refund/chargeback/leak → add the licence ID to `revoked-licences.txt`,
  commit. The Action re-signs `revocations.json` automatically.
- Never edit `revocations.json` by hand; it is generated and signed.
