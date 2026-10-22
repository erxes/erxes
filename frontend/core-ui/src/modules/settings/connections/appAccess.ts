export type ConnectionApp = { id: string; label: string };

export const connectionAppLabel = (id: string): string =>
  id === 'core'
    ? 'erxes workspace'
    : id
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const connectionApps = (
  installed: Record<string, { name: string }> | null,
): ConnectionApp[] => {
  const ids = new Set(['core']);
  for (const app of Object.values(installed || {})) {
    if (/^[a-z][a-z0-9-]{0,63}$/.test(app.name)) ids.add(app.name);
  }
  return [...ids].map((id) => ({ id, label: connectionAppLabel(id) }));
};

export const connectionAccessName = (app: string): string =>
  `${app} connection access`.slice(0, 120);

export const connectionSetupInstructions = ({
  connectionName,
  reference,
  pluginName,
  token,
}: {
  connectionName: string;
  reference: string;
  pluginName: string;
  token: string;
}): string =>
  [
    'Private erxes connection setup — share only with your trusted developer.',
    `Connection: ${connectionName}`,
    `App: ${connectionAppLabel(pluginName)}`,
    '',
    'Configure this backend app once:',
    '1. Set PLATFORM_CREDENTIALS_URL to this deployment’s HTTPS core-api origin (no /graphql or other path).',
    `2. Set PLATFORM_CREDENTIALS_REFERENCE to ${reference}`,
    `3. Set PLATFORM_CREDENTIALS_TOKEN to ${token}`,
    '4. Use getCredentialValues() from erxes-api-shared/utils in the app’s server-side provider integration.',
    '',
    'Do not put the token in browser code, source control, logs, or ordinary chat.',
    'These details allow access only to this connection. They do not automatically switch the app to it.',
    'Once the app is wired, it reads updated account details at runtime.',
  ].join('\n');
