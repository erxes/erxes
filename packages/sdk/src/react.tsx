import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  useLazyQuery as useApolloLazyQuery,
  useMutation as useApolloMutation,
  useQuery as useApolloQuery,
} from '@apollo/client';
import { REACT_APP_API_URL } from 'erxes-ui';
import { type ComponentType, createContext, lazy, useContext } from 'react';
import { pluginName } from './names';
import type { PermissionKey, Permissions } from './server';

// Set by `erxes-ext build`: the id from package.json, and the CSS it built
// from ui/src (only the Tailwind rules the host's own CSS lacks).
declare const __ERXES_EXT_ID__: string;
declare const __ERXES_EXT_CSS__: string;

let client: ApolloClient<object> | undefined;

// The extension's own client: its own cache, so its types never meet a
// plugin's of the same name, and one endpoint, its GraphQL on the runtime,
// as the signed-in user.
const extensionClient = () =>
  (client ??= new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: `${REACT_APP_API_URL}/pl:extensions/graphql/${__ERXES_EXT_ID__}`,
      credentials: 'include',
    }),
  }));

const injectStyles = () => {
  if (
    !__ERXES_EXT_CSS__ ||
    document.querySelector(`style[data-extension="${__ERXES_EXT_ID__}"]`)
  ) {
    return;
  }

  const style = document.createElement('style');
  style.dataset.extension = __ERXES_EXT_ID__;
  style.textContent = __ERXES_EXT_CSS__;
  document.head.append(style);
};

// The extension's client, in a context of its own rather than an
// ApolloProvider: the host's client stays the default, so erxes-ui and
// ui-modules widgets inside an extension component still query core.
const ExtensionClientContext = createContext<ApolloClient<object> | null>(null);

const useExtensionClient = () => {
  const contextClient = useContext(ExtensionClientContext);

  if (!contextClient) {
    throw new Error(
      'erxes-sdk/react hooks only work inside a component from extensionComponent()',
    );
  }

  return contextClient;
};

// Apollo's hooks, with the extension's client. Same signatures, so a
// TypedDocumentNode in gives typed data out.
export const useQuery: typeof useApolloQuery = (query, options) =>
  useApolloQuery(query, { ...options, client: useExtensionClient() });

export const useLazyQuery: typeof useApolloLazyQuery = (query, options) =>
  useApolloLazyQuery(query, { ...options, client: useExtensionClient() });

export const useMutation: typeof useApolloMutation = (mutation, options) =>
  useApolloMutation(mutation, { ...options, client: useExtensionClient() });

// A component for CONFIG, loaded when the host first renders it, with the
// extension's client in context for the hooks above:
//
//   component: extensionComponent(() =>
//     import('./ResponseTemplates').then((m) => m.ResponseTemplates),
//   )
export const extensionComponent = <P extends object>(
  load: () => Promise<ComponentType<P>>,
) => {
  // The props travel as one prop: React's lazy types can't spread a generic.
  const Lazy = lazy(async () => {
    injectStyles();
    const Component = await load();

    return { default: ({ props }: { props: P }) => <Component {...props} /> };
  });

  const ExtensionComponent = (props: P) => (
    <ExtensionClientContext.Provider value={extensionClient()}>
      <Lazy props={props} />
    </ExtensionClientContext.Provider>
  );

  return ExtensionComponent;
};

// The action `<Can action>` checks, from the extension's own permissions:
//
//   export const can = permissionAction<typeof extension>;
//   <Can action={can('responseTemplates.add')}>
export const permissionAction = <E extends { permissions: Permissions }>(
  permission: PermissionKey<E['permissions']>,
) => `${pluginName(__ERXES_EXT_ID__)}.${permission}`;
