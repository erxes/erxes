import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { logger, type RsbuildPlugin, type Rspack } from '@rsbuild/core';

/**
 * The most gzipped JS, in kB, a cold visit to each route may load: the app shell plus the
 * chunks of the route's lazy import in AppRoutes.tsx. The shell is the entry, `./bootstrap`,
 * AppRoutes itself and the libraries the host provides to plugins (erxes-ui, React, …), which
 * every route loads. Keys are the import paths without `~/modules/`. Each budget is about
 * 15 kB over the route's size when it was set.
 */
const BUDGET_KB: Record<string, number> = {
  'automations/AutomationsRoutes': 866,
  'contacts/ContactsRoutes': 896,
  'home/HomePage': 826,
  'notifications/NotificationsPage': 806,
  'onboarding/MainOnboardingPage': 816,
  'plugins/PluginPage': 806,
  'products/ProductsRoutes': 866,
  'reports/ReportsRoutes': 816,
  'settings/SettingsRoutes': 896,
};

const ROUTES_MODULE = './src/modules/app/AppRoutes.tsx';
const SHELL_REQUESTS = new Set(['./bootstrap', '~/modules/app/AppRoutes']);

/**
 * Modules that must never reach the browser: drizzle and core's tables. The contract's
 * root exports both table-built schemas and plain values, so one value import from the
 * wrong module would ship every table. `packages/db/src/enums.ts` imports nothing and
 * is what the contract's values build on.
 */
const SERVER_ONLY =
  /[\\/]node_modules[\\/](drizzle-orm|drizzle-zod)[\\/]|[\\/]packages[\\/]db[\\/](?!src[\\/]enums\.ts$)/;

/** A module's name and those of the modules concatenated into it. */
const namesOf = (module: Rspack.StatsModule): string[] => [
  module.name ?? '',
  ...(module.modules ?? []).flatMap(namesOf),
];

/**
 * Fails a production build when a route's JS goes over its budget or has none, or when
 * a browser chunk holds a server-only module.
 */
export const pluginBundleBudget = (): RsbuildPlugin => ({
  name: 'core:bundle-budget',
  setup(api) {
    api.onAfterEnvironmentCompile(({ stats, environment, isWatch }) => {
      if (isWatch || !stats || environment.config.mode !== 'production') return;

      const { chunks = [] } = stats.toJson({
        all: false,
        chunks: true,
        chunkOrigins: true,
        chunkModules: true,
        nestedModules: true,
      });

      const shipped = chunks.flatMap((chunk) => chunk.modules ?? []).flatMap(namesOf);
      const serverOnly = [...new Set(shipped.filter((name) => SERVER_ONLY.test(name)))];

      if (serverOnly.length > 0) {
        throw new Error(
          `Server-only modules in the browser bundle. A value came from a contract module built on a table: import it from @erxes/core-contract's values.ts, and keep coreContract an import type:\n  ${serverOnly.slice(0, 20).join('\n  ')}`,
        );
      }

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
          `Over the JS budget in apps/core-ui/bundleBudget.ts: ${over.join(', ')}. Load less up front: erxes-ui is one chunk every route loads, so a heavy part of it loads on first use (LazyEditor.tsx). Measure with pnpm --filter @erxes/core-ui perf (e2e/perf/measure.ts). A budget changes only in its own PR.`,
        );
      }
    });
  },
});
