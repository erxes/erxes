import type { ComponentType } from 'react';

export type RemoteComponentProps = object;
export type RemoteComponent = ComponentType<RemoteComponentProps>;
export type RemoteModule = Record<string, unknown> & {
  default?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isRemoteComponent = (value: unknown): value is RemoteComponent =>
  typeof value === 'function' || (isRecord(value) && '$$typeof' in value);

const toPascalCase = (value: string) =>
  value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

const getCandidateKeys = (remoteModuleName: string) => {
  const pascalName = toPascalCase(remoteModuleName);
  const nameWithoutWidget = pascalName.endsWith('Widget')
    ? pascalName.slice(0, -'Widget'.length)
    : pascalName;

  return [
    'default',
    pascalName,
    `${pascalName}Component`,
    `${nameWithoutWidget}RemoteEntry`,
    `${nameWithoutWidget}RemoteEntries`,
    `${nameWithoutWidget}Widget`,
    'AutomationRemoteEntries',
  ];
};

export const resolveRemoteComponent = (
  remoteModule: RemoteModule | null | undefined,
  remoteModuleName: string,
) => {
  if (!remoteModule) {
    return null;
  }

  for (const key of getCandidateKeys(remoteModuleName)) {
    const candidate = remoteModule[key];

    if (isRemoteComponent(candidate)) {
      return candidate;
    }
  }

  return Object.values(remoteModule).find(isRemoteComponent) || null;
};
