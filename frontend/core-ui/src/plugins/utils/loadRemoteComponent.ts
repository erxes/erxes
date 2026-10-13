import { loadRemote } from '@module-federation/enhanced/runtime';
import {
  RemoteComponent,
  RemoteModule,
  resolveRemoteComponent,
} from './resolveRemoteComponent';

const loadedComponents = new Map<string, RemoteComponent>();
const pendingComponents = new Map<string, Promise<RemoteComponent>>();

export const getRemoteComponentKey = (
  pluginName: string,
  remoteModuleName: string,
) => `${pluginName}/${remoteModuleName}`;

export const getLoadedRemoteComponent = (key: string) =>
  loadedComponents.get(key);

export const loadRemoteComponent = (
  pluginName: string,
  remoteModuleName: string,
): Promise<RemoteComponent> => {
  const key = getRemoteComponentKey(pluginName, remoteModuleName);
  const loaded = loadedComponents.get(key);

  if (loaded) {
    return Promise.resolve(loaded);
  }

  const pending = pendingComponents.get(key);

  if (pending) {
    return pending;
  }

  const request = loadRemote<RemoteModule>(key, { from: 'runtime' })
    .then((remoteModule) => {
      const component = resolveRemoteComponent(remoteModule, remoteModuleName);

      if (!component) {
        throw new Error('Plugin module is empty or invalid');
      }

      loadedComponents.set(key, component);

      return component;
    })
    .finally(() => pendingComponents.delete(key));

  pendingComponents.set(key, request);

  return request;
};
