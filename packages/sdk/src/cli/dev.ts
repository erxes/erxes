import { existsSync, watch } from 'node:fs';
import path from 'node:path';
import { type InstallOptions, installExtension } from './install';

// Codegen writes these; watching them would rebuild forever.
const GENERATED = /(^|[/\\])(gql|dist)([/\\]|$)/;

// Rebuilds and reinstalls the same version on every change under server/ and
// ui/src/. The runtime takes a same-version reinstall only with
// EXT_DEV_MODE=true, and then serves UI files uncached: reload the page to
// see a change.
export const dev = async (extDir: string, options: InstallOptions) => {
  let running = false;
  let again = false;
  let timer: NodeJS.Timeout | undefined;

  const run = async () => {
    if (running) {
      again = true;
      return;
    }

    running = true;
    const started = Date.now();

    try {
      const { id, version } = await installExtension(extDir, options);
      console.log(
        `installed ${id}@${version} in ${
          Date.now() - started
        }ms. Reload the page.`,
      );
    } catch (e) {
      console.error(e instanceof Error ? e.message : e);
    } finally {
      running = false;

      if (again) {
        again = false;
        void run();
      }
    }
  };

  await run();

  const dirs = ['server', 'ui/src'].filter((dir) =>
    existsSync(path.join(extDir, dir)),
  );

  for (const dir of dirs) {
    watch(path.join(extDir, dir), { recursive: true }, (_, file) => {
      if (file && GENERATED.test(file)) {
        return;
      }

      clearTimeout(timer);
      timer = setTimeout(() => void run(), 300);
    });
  }

  console.log(`watching ${dirs.join(' and ')}`);
};
