import {
  CORE_API_PREFIX,
  PLUGIN_SESSION_SCHEME,
  type PluginApiAudience,
} from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import type { createApiReference } from '@scalar/api-reference';
import { skipToken, useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { z } from 'zod';
import { QueryState } from '~/components/QueryState';
import { useAppliedTheme } from '~/modules/app/ThemeEffect';

/** Who a reference is for: the routes core's `/openapi/<audience>.json` lists. */
export type ApiAudience = 'member' | 'customer';

type CreateApiReference = typeof createApiReference;

/** Scalar's browser build, which rsbuild.config.ts copies here; it loads its own chunks. */
const SCALAR_URL = '/static/scalar/standalone.esm.js';

const ScalarModule = z.object({
  createApiReference: z.custom<CreateApiReference>((value) => typeof value === 'function'),
});

/** Loads Scalar on first use, outside the app's bundle. */
const loadScalar = async () =>
  ScalarModule.parse(await import(/* webpackIgnore: true */ SCALAR_URL)).createApiReference;

/** Scalar in erxes-ui's colours, which follow the light and dark themes. */
const ERXES_COLORS = `
.light-mode, .dark-mode {
  --scalar-background-1: var(--background);
  --scalar-background-2: var(--muted);
  --scalar-background-3: var(--accent);
  --scalar-color-1: var(--foreground);
  --scalar-color-2: var(--muted-foreground);
  --scalar-color-3: var(--muted-foreground);
  --scalar-color-accent: var(--primary-text);
  --scalar-border-color: var(--border);
}`;

/** A document to show: core's for an audience, or one of an installed plugin's from its own API. */
export type ReferenceSource =
  | { audience: ApiAudience }
  | { plugin: string; audience: PluginApiAudience; apiUrl: string; path: string };

/** Where the document is and where its calls go: core's own origin, or the plugin's API. */
const locate = (source: ReferenceSource) =>
  'plugin' in source
    ? { url: `${source.apiUrl}${source.path}`, server: source.apiUrl }
    : {
        url: `${CORE_API_PREFIX}/openapi/${source.audience}.json`,
        server: window.location.origin,
      };

type ScalarConfig = Parameters<ReturnType<CreateApiReference>['updateConfiguration']>[0];

/** A plugin reference fills in the member's session token, so "try it" calls as them. */
const configFor = (
  url: string,
  server: string,
  theme: 'light' | 'dark',
  token?: string,
): ScalarConfig => ({
  url,
  servers: [{ url: server }],
  layout: 'modern',
  forceDarkModeState: theme,
  hideDarkModeToggle: true,
  // No proxy, telemetry, agent or remote fonts: calls go straight to core or the plugin.
  // Scalar's own toolbar (share, SDKs, deploy) links to its hosted services.
  showDeveloperTools: 'never',
  withDefaultFonts: false,
  telemetry: false,
  persistAuth: false,
  agent: { disabled: true },
  mcp: { disabled: true },
  documentDownloadType: 'json',
  customCss: ERXES_COLORS,
  authentication: token
    ? {
        preferredSecurityScheme: PLUGIN_SESSION_SCHEME,
        securitySchemes: { [PLUGIN_SESSION_SCHEME]: { token } },
      }
    : undefined,
});

/** Plugin session tokens last 5 minutes: get the next one a minute early. */
const SESSION_REFRESH_MS = 4 * 60_000;

/** The member's session token for a plugin's API, kept fresh, so "try it" works signed in. */
const useSessionToken = (plugin: string | null) => {
  const session = useQuery(
    orpc.plugins.session.queryOptions({
      input: plugin ? { name: plugin } : skipToken,
      staleTime: SESSION_REFRESH_MS,
      refetchInterval: SESSION_REFRESH_MS,
    }),
  );

  return session.data?.token;
};

const Reference = ({ create, source }: { create: CreateApiReference; source: ReferenceSource }) => {
  const theme = useAppliedTheme();
  const { url, server } = locate(source);

  // Only a member document signs in as the member; customers and websites bring their own.
  const token = useSessionToken(
    'plugin' in source && source.audience === 'member' ? source.plugin : null,
  );

  const container = useRef<HTMLDivElement>(null);
  const instance = useRef<ReturnType<CreateApiReference> | null>(null);

  useEffect(() => {
    if (!container.current) return;

    const reference = create(container.current, configFor(url, server, theme));

    instance.current = reference;

    return () => {
      instance.current = null;
      reference.destroy();
    };
  }, [create, url, server, theme]);

  // A new token updates the open reference in place, keeping where the member is.
  useEffect(() => {
    if (!token) return;

    instance.current?.updateConfiguration(configFor(url, server, theme, token));
  }, [url, server, theme, token]);

  return <div ref={container} />;
};

/** One API reference, with Scalar's client to try calls. */
export const ApiReferenceView = ({ source }: { source: ReferenceSource }) => {
  const scalar = useQuery({ queryKey: ['scalar'], queryFn: loadScalar, staleTime: Infinity });

  return (
    <QueryState query={scalar} className="py-12">
      {(create) => <Reference create={create} source={source} />}
    </QueryState>
  );
};
