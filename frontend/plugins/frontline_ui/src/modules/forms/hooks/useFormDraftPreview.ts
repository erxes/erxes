import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import {
  formDraftSchema,
  formDraftSnapshotAtom,
} from '../states/formSetupStates';

export const useFormDraftPreviewPublisher = (draftId: string) => {
  const snapshot = useAtomValue(formDraftSnapshotAtom);
  const latest = useRef(snapshot);
  const channel = useRef<BroadcastChannel>();
  latest.current = snapshot;

  useEffect(() => {
    const connection = new BroadcastChannel(
      `frontline-form-preview:${draftId}`,
    );
    channel.current = connection;
    connection.onmessage = (event: MessageEvent<unknown>) => {
      if (event.data === 'request') connection.postMessage(latest.current);
    };
    return () => {
      channel.current = undefined;
      connection.close();
    };
  }, [draftId]);

  useEffect(() => {
    channel.current?.postMessage(snapshot);
  }, [snapshot]);
};

export const useFormDraftPreviewSubscriber = (draftId: string | null) => {
  const setSnapshot = useSetAtom(formDraftSnapshotAtom);
  useEffect(() => {
    if (!draftId) return;
    const connection = new BroadcastChannel(
      `frontline-form-preview:${draftId}`,
    );
    connection.onmessage = (event: MessageEvent<unknown>) => {
      const draft = formDraftSchema.safeParse(event.data);
      if (draft.success) setSnapshot(draft.data);
    };
    connection.postMessage('request');
    return () => connection.close();
  }, [draftId, setSnapshot]);
};
