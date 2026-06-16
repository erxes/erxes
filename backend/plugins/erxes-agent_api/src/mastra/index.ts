/**
 * Mastra CLI entrypoint for the erxes-agent Studio bridge.
 *
 * The `mastra` CLI resolves its instance at the conventional `src/mastra/index.ts`
 * (a custom `--dir` mis-resolves the dev server's run path). The actual bridge
 * lives under `src/studio/*`; this file is ONLY the CLI entry and is never
 * imported by the erxes plugin runtime (main.ts / startPlugin).
 *
 * Run:  pnpm exec mastra dev --env ../../../.env   (from this plugin dir)
 */
export { mastra } from '~/studio';
