import { REACT_APP_API_URL } from 'erxes-ui/utils';

/**
 * A remote as `/get-frontend-plugins` lists it. An extension's entry is a
 * path on the gateway, so each tenant loads it from its own API URL.
 */
export type FrontendRemote = {
  name: string;
  entry: string;
  kind?: 'plugin' | 'extension';
};

const extensionRemotes = new Set<string>();

/** Whether core-api listed this remote as an installed extension. */
export const isExtensionRemote = (remoteName: string) =>
  extensionRemotes.has(remoteName);

/** Where an extension may live: core, or any loaded plugin. */
export const extensionHosts = (remotes: { name: string }[]) => [
  'core',
  ...remotes
    .filter(({ name }) => !isExtensionRemote(name))
    .map(({ name }) => name.replace(/_ui$/, '')),
];

/** Remembers which remotes are extensions; returns what federation takes. */
export const toFederationRemotes = (remotes: FrontendRemote[]) =>
  remotes.map(({ name, entry, kind }) => {
    if (kind === 'extension') {
      extensionRemotes.add(name);
    }

    return {
      name,
      entry: kind === 'extension' ? `${REACT_APP_API_URL}${entry}` : entry,
    };
  });
