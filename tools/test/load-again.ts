import { createRequire } from 'node:module';

/**
 * Loads packages again, past Node's module cache, as a plugin UI bundles its own copy of a
 * library web doesn't share. `from` is the test's `import.meta.url`. Modules whose path holds
 * `scope` (`/@dnd-kit/`) load afresh with the packages; the rest, React too, stay one copy.
 */
export const loadAgain = (from: string, scope: string, names: string[]): unknown[] => {
  const require = createRequire(from);
  const cached = Object.keys(require.cache).filter((path) => path.includes(scope));
  const kept = cached.map((path) => [path, require.cache[path]] as const);

  for (const path of cached) Reflect.deleteProperty(require.cache, path);

  try {
    return names.map((name): unknown => require(name));
  } finally {
    for (const [path, module] of kept) require.cache[path] = module;
  }
};
