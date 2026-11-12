/** The test plugin's client secret (CORE_PLUGIN_KEYS in vitest.config.ts). */
export const HR_SECRET = 'test-hr-plugin-key-0123456789abcdefghijklmnop';

/** Exchanges the plugin's client secret for a token (`POST /core/v1/plugins/token`). */
export const requestPluginToken = async (
  base: string,
  org?: string,
  secret = HR_SECRET,
  clientId = 'hr',
) => {
  const response = await fetch(`${base}/core/v1/plugins/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: secret,
      org,
    }),
  });

  const body = (await response.json()) as { access_token?: string; code?: string; scope?: string };

  return { status: response.status, body };
};

/** A token for `org`, or throws. */
export const pluginToken = async (base: string, org?: string, secret = HR_SECRET) => {
  const { status, body } = await requestPluginToken(base, org, secret);

  if (status !== 200 || !body.access_token)
    throw new Error(`no plugin token (${status} ${body.code})`);

  return body.access_token;
};
