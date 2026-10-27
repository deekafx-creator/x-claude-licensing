# X-Claude Copilot — licensing (GitHub + Resend)

This public repository is the licence bulletin board for X-Claude Copilot:

- **`revocations.json`** — signed list of revoked licence hashes. Extensions
  download it from the raw GitHub URL and disable a copy whose licence hash
  appears here. It is generated; never edit it by hand.
- **`revoked-licences.txt`** — the human-edited source list. Committing a
  change re-signs `revocations.json` automatically.
- **Actions → "Send activation email"** — signs a one-buyer activation code
  with an Ed25519 private key kept in GitHub Secrets and emails it through
  Resend. The code never appears in workflow logs.

Full instructions: **SETUP-CHECKLIST.md**.

## About free domains (read before chasing one)

Resend can only send to arbitrary buyers from a domain **you control the DNS
of**. Free options exist, but each has a real catch:

| Option | Cost | Catch |
|---|---|---|
| `something.eu.org` (nic.eu.org) + free DNS (e.g. deSEC) | Free | Manual approval can take days–weeks; aimed at users/non-profits who cannot pay; no support |
| `something.is-a.dev` | Free | For developer/open-source projects; commercial licence email may be rejected; approval via pull request |
| FreeDNS (afraid.org) shared subdomains | Free | Someone else owns the parent domain and can revoke it; poor sender reputation; unprofessional address |
| Freenom-style free TLDs (.tk/.ml/...) | — | Dead. Do not touch; the free programme collapsed and the names were widely abused |
| A cheap domain of your own (.com etc.) | roughly $5–15/year | None that matter. This is the recommended route |

GitHub itself does **not** give you an email-capable domain:
`username.github.io` cannot receive the MX/TXT records Resend requires.

Until you have a domain, Resend's test sender
(`onboarding@resend.dev`) can email **only your own Resend account address** —
enough to prove the whole pipeline works, not enough for buyers.

## Security rules

- The Ed25519 **private key lives only in GitHub Secrets**
  (`LICENCE_SIGNING_PRIVATE_KEY`) plus your one offline backup.
- The Resend API key lives only in GitHub Secrets (`RESEND_API_KEY`).
- Nothing secret is ever committed; `.gitignore` guards the key files, but
  check before every commit anyway.
- Published files contain licence **hashes**, never buyer emails or raw
  licence IDs.
