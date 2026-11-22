import { useSyncExternalStore } from 'react';
import type { CountryCode } from 'libphonenumber-js';
import type * as PhoneLibModule from './phoneLib';

type PhoneLib = typeof PhoneLibModule;

let lib: PhoneLib | null = null;
let loading: Promise<PhoneLib> | null = null;
const listeners = new Set<() => void>();

/**
 * Loads the phone library, once. `formatPhoneNumber` formats in full after it resolves;
 * `usePhoneFormatter` re-renders when it does.
 */
export const loadPhoneFormatter = (): Promise<PhoneLib> => {
  loading ??= import('./phoneLib').then((loaded) => {
    lib = loaded;

    for (const listener of listeners) listener();

    return loaded;
  });

  return loading;
};

/** The phone library if it has loaded, else null and it starts loading. */
export const getPhoneLib = (): PhoneLib | null => {
  if (!lib) void loadPhoneFormatter();

  return lib;
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);

  return () => listeners.delete(listener);
};

/** The phone library, re-rendering once it loads: null until then. */
export const usePhoneLib = (): PhoneLib | null =>
  useSyncExternalStore(subscribe, getPhoneLib, () => null);

/**
 * A phone number formatted as people write it, even half typed.
 * `defaultCountry` decides how a number without a `+` code reads. The library loads on the
 * first call: until it has, the number comes back as given. In a component,
 * `usePhoneFormatter` re-renders with the formatted number once it loads.
 */
export const formatPhoneNumber = ({
  defaultCountry,
  value,
}: {
  defaultCountry?: CountryCode;
  value: string;
}): string => {
  const phoneLib = getPhoneLib();

  return phoneLib ? new phoneLib.AsYouType({ defaultCountry }).input(value) : value;
};

/**
 * `formatPhoneNumber` for a component, re-rendered once the library loads.
 * Call it once in a component that shows phones and format with what it returns.
 */
export const usePhoneFormatter = (): typeof formatPhoneNumber => {
  usePhoneLib();

  return formatPhoneNumber;
};
