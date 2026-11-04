import { isDeeplyEqual, useConfirm } from 'erxes-ui';
import { useAtomValue, useStore } from 'jotai';
import { useCallback, useEffect, useRef } from 'react';
import { ticketCreateSessionsState } from '@/ticket/states/ticketCreateSessionsState';
import { ticketFormDraftsState } from '@/ticket/states/ticketFormDraftsState';
import type { TAddTicket } from '@/ticket/types';

/** Owns one user's resumable ticket creation and admits only its current request. */
export const useTicketCreateSession = ({
  slotKey,
  defaults,
  discardMessage,
  onCreated,
}: {
  slotKey: string;
  defaults: TAddTicket;
  discardMessage: string;
  onCreated: (ticketId: string) => void;
}): {
  defaults: TAddTicket;
  recordKey: string;
  pending: boolean;
  discard: () => boolean;
  beginSubmission: () => symbol | undefined;
  completeSubmission: (
    request: symbol,
    ticketId: string,
    submitted: TAddTicket,
  ) => void;
  failSubmission: (request: symbol) => void;
} => {
  const store = useStore();
  const state = ticketCreateSessionsState({ key: slotKey, defaults });
  const session = useAtomValue(state);
  const { confirm } = useConfirm();
  const onCreatedRef = useRef(onCreated);
  onCreatedRef.current = onCreated;
  const previousSource = useRef<TAddTicket>();
  const recordKey = `${slotKey}:${session.generation}`;

  /** Starts a new creation generation and removes the preceding draft. */
  const replace = useCallback(
    (nextDefaults: TAddTicket) => {
      const current = store.get(state);
      const currentKey = `${slotKey}:${current.generation}`;
      store.set(ticketFormDraftsState, (previous) => {
        return Object.fromEntries(
          Object.entries(previous).filter(([key]) => key !== currentKey),
        );
      });
      store.set(state, {
        ...current,
        defaults: nextDefaults,
        generation: current.generation + 1,
        pending: undefined,
      });
    },
    [slotKey, state, store],
  );

  useEffect(() => {
    previousSource.current = undefined;
    /** Routes a successful creation through the currently mounted form owner. */
    const notify = (ticketId: string) => onCreatedRef.current(ticketId);
    store.set(state, (current) => ({ ...current, onCreated: notify }));
    return () => {
      store.set(state, (current) =>
        current.onCreated === notify
          ? { ...current, onCreated: undefined }
          : current,
      );
    };
  }, [state, store]);

  useEffect(() => {
    if (
      previousSource.current &&
      isDeeplyEqual(previousSource.current, defaults, { strict: true })
    )
      return;
    previousSource.current = defaults;
    const current = store.get(state);
    if (isDeeplyEqual(current.defaults, defaults, { strict: true })) return;
    /** Applies replacement defaults only while their requesting form and session remain current. */
    const accept = () => {
      const latest = store.get(state);
      if (
        latest.generation === current.generation &&
        latest.onCreated === current.onCreated &&
        isDeeplyEqual(previousSource.current, defaults, { strict: true })
      )
        replace(defaults);
    };
    const draft = store.get(ticketFormDraftsState)[
      `${slotKey}:${current.generation}`
    ];
    if (draft) {
      confirm({ message: discardMessage }).then(accept, () => undefined);
    } else {
      accept();
    }
  }, [defaults, discardMessage, confirm, replace, slotKey, state, store]);

  /** Discards only the current creation session after approval. */
  const discard = () => {
    const current = store.get(state);
    if (current.generation !== session.generation) return false;
    replace(current.defaults);
    return true;
  };
  /** Admits one create request for the current shared session. */
  const beginSubmission = (): symbol | undefined => {
    const current = store.get(state);
    if (current.generation !== session.generation || current.pending)
      return undefined;
    const request = Symbol('ticket-create');
    store.set(state, { ...current, pending: request });
    return request;
  };
  /** Releases pending state only for the request that still owns it. */
  const failSubmission = (request: symbol) => {
    store.set(state, (current) =>
      current.pending === request
        ? { ...current, pending: undefined }
        : current,
    );
  };
  /** Acknowledges the owning create without rebasing newer unsaved edits. */
  const completeSubmission = (
    request: symbol,
    ticketId: string,
    submitted: TAddTicket,
  ) => {
    const current = store.get(state);
    if (current.pending !== request) return;
    const draft = store.get(ticketFormDraftsState)[
      `${slotKey}:${current.generation}`
    ];
    if (
      !isDeeplyEqual(draft?.values ?? current.defaults, submitted, {
        strict: true,
      })
    ) {
      failSubmission(request);
      return;
    }
    replace(current.defaults);
    current.onCreated?.(ticketId);
  };

  return {
    defaults: session.defaults,
    recordKey,
    pending: Boolean(session.pending),
    discard,
    beginSubmission,
    completeSubmission,
    failSubmission,
  };
};
