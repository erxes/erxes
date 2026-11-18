import { Response } from 'express';

/**
 * Server-rendered pages of the erxes sign-in for products (OAuth authorize).
 * Plain forms, no scripts: they work without core-ui and the gateway.
 */
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const STYLE = `
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
    font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;background:#f4f4f6;color:#18181b}
  main{width:100%;max-width:380px;margin:24px;padding:32px;background:#fff;border-radius:14px;
    box-shadow:0 1px 3px rgba(0,0,0,.08),0 8px 24px rgba(0,0,0,.06)}
  h1{margin:0 0 4px;font-size:20px}
  p{margin:0 0 20px;color:#52525b}
  label{display:block;margin:0 0 6px;font-weight:600;font-size:13px}
  input{width:100%;padding:10px 12px;margin:0 0 16px;border:1px solid #d4d4d8;border-radius:8px;font:inherit}
  input:focus{outline:2px solid #4f46e5;outline-offset:1px;border-color:#4f46e5}
  button{width:100%;padding:11px;border:0;border-radius:8px;background:#4f46e5;color:#fff;font:inherit;font-weight:600;cursor:pointer}
  button:hover{background:#4338ca}
  .error{margin:0 0 16px;padding:10px 12px;border-radius:8px;background:#fef2f2;color:#b91c1c}
  .muted{margin:16px 0 0;font-size:13px;color:#71717a}`;

const layout = (title: string, body: string) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(title)}</title>
<style>${STYLE}</style>
</head>
<body><main>${body}</main></body>
</html>`;

const send = (res: Response, status: number, html: string) => {
  res
    .status(status)
    .set({
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Security-Policy':
        "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    })
    .send(html);
};

const errorBox = (message?: string) =>
  message ? `<div class="error" role="alert">${escapeHtml(message)}</div>` : '';

export const renderLoginPage = (
  res: Response,
  {
    requestId,
    clientName,
    email = '',
    error,
    status = 200,
  }: {
    requestId: string;
    clientName: string;
    email?: string;
    error?: string;
    status?: number;
  },
) =>
  send(
    res,
    status,
    layout(
      'Sign in with erxes',
      `<h1>Sign in with erxes</h1>
<p>to continue to <strong>${escapeHtml(clientName)}</strong></p>
${errorBox(error)}
<form method="post" action="authorize/login">
<input type="hidden" name="request" value="${escapeHtml(requestId)}">
<label for="email">Email or username</label>
<input id="email" name="email" autocomplete="username" required autofocus value="${escapeHtml(
        email,
      )}">
<label for="password">Password</label>
<input id="password" name="password" type="password" autocomplete="current-password" required>
<button type="submit">Sign in</button>
</form>`,
    ),
  );

export const renderTwoFactorPage = (
  res: Response,
  {
    requestId,
    challenge,
    clientName,
    error,
    status = 200,
  }: {
    requestId: string;
    challenge: string;
    clientName: string;
    error?: string;
    status?: number;
  },
) =>
  send(
    res,
    status,
    layout(
      'Two-factor code',
      `<h1>Two-factor code</h1>
<p>Enter the code from your authenticator app to continue to <strong>${escapeHtml(
        clientName,
      )}</strong>. A recovery code also works.</p>
${errorBox(error)}
<form method="post" action="authorize/two-factor">
<input type="hidden" name="request" value="${escapeHtml(requestId)}">
<input type="hidden" name="challenge" value="${escapeHtml(challenge)}">
<label for="code">Code</label>
<input id="code" name="code" inputmode="numeric" autocomplete="one-time-code" required autofocus>
<button type="submit">Verify</button>
</form>`,
    ),
  );

/** A dead end: never redirects, because the request itself could not be trusted. */
export const renderMessagePage = (
  res: Response,
  {
    title,
    message,
    status,
  }: { title: string; message: string; status: number },
) =>
  send(
    res,
    status,
    layout(title, `<h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p>`),
  );
