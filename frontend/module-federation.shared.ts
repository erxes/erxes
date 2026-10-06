import type { SharedLibraryConfig } from '@nx/rspack/module-federation';

const npmAliasVersion = /^npm:.+@(.+)$/;

export const withoutNpmAlias = (
  config: SharedLibraryConfig,
): SharedLibraryConfig => {
  const aliased = npmAliasVersion.exec(String(config.requiredVersion));
  return aliased
    ? { ...config, requiredVersion: aliased[1], strictVersion: false }
    : config;
};
