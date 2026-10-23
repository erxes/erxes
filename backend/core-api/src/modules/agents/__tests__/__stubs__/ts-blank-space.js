/**
 * Test stub for `ts-blank-space` (the TypeScript type-stripper
 * `@mastra/quickjs` uses to erase types from sandbox programs on the host).
 *
 * Two reasons this stub exists:
 * 1. `@mastra/quickjs@0.1.0`'s CJS bundle calls `ts_blank_space.default`
 *    through esbuild's `__toESM(mod, 1)` helper; for the real ESM-only
 *    package that yields the module namespace, not the function — a
 *    packaging bug that breaks every CJS consumer, jest included.
 * 2. Loading the real ESM entry inside jest instead drags in real-ESM
 *    module loading (`--experimental-vm-modules`) and the WASM variant's
 *    dynamic imports.
 *
 * The stub is a callable `module.exports` (so `__toESM`'s `.default` is the
 * function itself) that passes the program through unchanged. The programs
 * exercised in this suite are plain JavaScript; production strips types
 * through the real ESM package before the program reaches the sandbox.
 */
module.exports = function tsBlankSpace(program) {
  return program;
};
