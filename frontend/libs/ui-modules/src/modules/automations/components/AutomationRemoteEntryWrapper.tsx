import React from 'react';
import {
  AutomationRemoteEntryComponentType,
  AutomationRemoteEntryTypes,
} from '../types/automationTypes';

export const AutomationRemoteEntryWrapper = <
  T extends AutomationRemoteEntryComponentType,
>({
  props,
  remoteEntries,
}: {
  props: AutomationRemoteEntryTypes[T] & { componentType: T };
  remoteEntries: {
    [K in AutomationRemoteEntryComponentType]?:
      | React.LazyExoticComponent<
          React.ComponentType<AutomationRemoteEntryTypes[K]>
        >
      | React.ComponentType<AutomationRemoteEntryTypes[K]>;
  };
}) => {
  const { componentType } = props;

  const RemoteEntryComponent = remoteEntries[componentType] as
    | React.ComponentType<AutomationRemoteEntryTypes[T]>
    | undefined;

  if (!RemoteEntryComponent) return null;

  return <RemoteEntryComponent {...(props as any)} />;
};
