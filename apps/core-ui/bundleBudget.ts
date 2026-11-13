import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { logger, type RsbuildPlugin } from '@rsbuild/core';

/**
 * The most gzipped JS, in kB, a cold visit to each route may load: the app shell plus the
 * chunks of the route's lazy import in AppRoutes.tsx. The shell is the entry, `./bootstrap`,
 * AppRoutes itself and the libraries the host provides to plugins (erxes-ui, React, …), which
 * every route loads. Keys are the import paths without `~/modules/`. Each budget is about
 * 15 kB over the route's size when it was set.
 */
const BUDGET_KB: Record<string, number> = {
  'automations/AutomationsRoutes': 850,
  'contacts/ContactsRoutes': 880,
  'home/HomePage': 810,
  'notifications/NotificationsPage': 790,
  'onboarding/MainOnboardingPage': 800,
  'plugins/PluginPage': 790,
  'products/ProductsRoutes': 850,
  'reports/ReportsRoutes': 800,
  'settings/SettingsRoutes': 880,
};

const ROUTES_MODULE = './src/modules/app/AppRoutes.tsx';
const SHELL_REQUESTS = new Set(['./bootstrap', '~/modules/app/AppRoutes']);

/** Fails a production build when a route's JS goes over its budget or has none. */
export const pluginBundleBudget = (): RsbuildPlugin => ({
  name: 'core:bundle-budget',
  setup(api) {
    api.onAfterEnvironmentCompile(({ stats, environment, isWatch }) => {
      if (isWatch || !stats || environment.config.mode !== 'production') return;

      const { chunks = [] } = stats.toJson({ all: false, chunks: true, chunkOrigins: true });

      const jsFiles = (selected: typeof chunks) =>
        selected.flatMap((chunk) => chunk.files ?? []).filter((file) => file.endsWith('.js'));

      const shell = jsFiles(
        chunks.filter(
          (chunk) =>
            chunk.initial ||
            chunk.origins?.some(
              (origin) =>
                SHELL_REQUESTS.has(origin.request) ||
                origin.moduleName.startsWith('provide shared module'),
            ),
        ),
      );

      const routes = new Set(
        chunks.flatMap((chunk) =>
          (chunk.origins ?? [])
            .filter((origin) => origin.moduleName === ROUTES_MODULE)
            .map((origin) => origin.request),
        ),
      );

      const gzipKb = (files: Iterable<string>) => {
        let bytes = 0;

        for (const file of files)
          bytes += gzipSync(readFileSync(join(environment.distPath, file))).length;

        return Math.round(bytes / 1024);
      };

      const report = [...routes].toSorted().map((request) => {
        const route = request.replace('~/modules/', '');

        const own = jsFiles(
          chunks.filter((chunk) => chunk.origins?.some((origin) => origin.request === request)),
        );

        const kb = gzipKb(new Set([...shell, ...own]));
        const budget = BUDGET_KB[route];

        return { route, kb, budget, over: budget === undefined || kb > budget };
      });

      const lines = report.map(
        ({ route, kb, budget }) =>
          `  ${route.padEnd(34)} ${String(kb).padStart(5)} kB / ${budget === undefined ? 'no budget' : `${budget} kB`}`,
      );

      logger.info(
        `JS per route, gzipped (shell ${gzipKb(new Set(shell))} kB):\n${lines.join('\n')}`,
      );

      const over = report.filter((entry) => entry.over).map((entry) => entry.route);

      if (over.length > 0) {
        throw new Error(
          `Over the JS budget in apps/core-ui/bundleBudget.ts: ${over.join(', ')}. Load less up front, or raise the budget and say why.`,
        );
      }
    });
  },
});
