/**
 * A payload as the queue can carry it, with any cycle broken.
 *
 * A value is only a cycle when it contains itself, so the chain of holders is
 * what is checked rather than everything met so far. Treating every second
 * sighting of an object as a cycle dropped shared references, which is how a
 * change log's `added` lost the very subdocument it was reporting: the diff
 * names the same object the document it came from already carried.
 */
export const toSerializablePayload = <T>(payload: T): T => {
  if (typeof payload === 'undefined') {
    return payload;
  }

  const ancestors: unknown[] = [];

  return JSON.parse(
    JSON.stringify(
      payload,
      function (this: unknown, _key: string, value: unknown) {
        if (typeof value !== 'object' || value === null) {
          return value;
        }

        // `this` is the object holding the value, so unwinding to it leaves
        // exactly this value's ancestors on the stack.
        while (
          ancestors.length &&
          ancestors[ancestors.length - 1] !== this
        ) {
          ancestors.pop();
        }

        if (ancestors.includes(value)) {
          return undefined;
        }

        ancestors.push(value);

        return value;
      },
    ),
  );
};
