import { useState } from 'react';

let counter = 0;

const newKey = () => {
  counter += 1;

  return `item-${counter}`;
};

/**
 * Stable React keys for an editable list whose items have no id (condition rules, switch
 * cases). Call `added` and `removed` next to the change, so a row keeps its key when an
 * earlier one goes. A list replaced from outside keeps its first keys and gains or drops the rest.
 */
export const useItemKeys = (length: number) => {
  const [keys, setKeys] = useState(() => Array.from({ length }, newKey));

  const synced =
    keys.length === length ? keys : Array.from({ length }, (_, at) => keys[at] ?? newKey());

  if (synced !== keys) setKeys(synced);

  return {
    keyAt: (index: number) => synced[index] ?? String(index),
    added: () => setKeys((current) => [...current, newKey()]),
    removed: (index: number) => setKeys((current) => current.filter((_, at) => at !== index)),
  };
};
