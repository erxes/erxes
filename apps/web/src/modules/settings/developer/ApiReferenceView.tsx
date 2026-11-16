import { CORE_API_PREFIX } from '@erxes/core-contract';
import type { createApiReference } from '@scalar/api-reference';
import { useQuery } from '@tanstack/react-query';
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

const Reference = ({ create, audience }: { create: CreateApiReference; audience: ApiAudience }) => {
  const theme = useAppliedTheme();
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // Calls go straight to this core: no proxy, telemetry, agent or remote fonts.
    const reference = create(container.current, {
      url: `${CORE_API_PREFIX}/openapi/${audience}.json`,
      baseServerURL: window.location.origin,
      layout: 'modern',
      forceDarkModeState: theme,
      hideDarkModeToggle: true,
      // Scalar's own toolbar (share, SDKs, deploy) links to its hosted services.
      showDeveloperTools: 'never',
      withDefaultFonts: false,
      telemetry: false,
      persistAuth: false,
      agent: { disabled: true },
      mcp: { disabled: true },
      documentDownloadType: 'json',
      customCss: ERXES_COLORS,
    });

    return () => reference.destroy();
  }, [create, audience, theme]);

  return <div ref={container} />;
};

/** One audience's API reference, with Scalar's client to try calls. */
export const ApiReferenceView = ({ audience }: { audience: ApiAudience }) => {
  const scalar = useQuery({ queryKey: ['scalar'], queryFn: loadScalar, staleTime: Infinity });

  return (
    <QueryState query={scalar} className="py-12">
      {(create) => <Reference create={create} audience={audience} />}
    </QueryState>
  );
};
