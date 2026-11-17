import { useToast } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { finishContactConnection } from './contactConnection';

export type ContactConnectionMessages = {
  cannotConnectTitle: string;
  cannotConnectDescription: string;
  failed: string;
  connected: string;
  refreshFailed: string;
};

type ContactConnectionOptions<TRecord, TVariables, TSaved> = {
  // Reads the record fresh from the server so stale candidates are rejected.
  loadRecord: (id: string) => Promise<TRecord | null | undefined>;
  getUpdate: (record: TRecord) => TVariables | null;
  // Saves the update and writes the record into the contact lists' cache.
  save: (
    record: TRecord,
    variables: TVariables,
  ) => Promise<TSaved | null | undefined>;
  // Refetches the contact lists after a successful save.
  refreshLists: (record: TRecord, saved: TSaved) => Promise<unknown>;
  reloadCandidates: () => Promise<unknown>;
  onConnected: () => void;
  messages: ContactConnectionMessages;
};

/**
 * The connect flow shared by the existing-task and existing-project pickers:
 * one connection at a time, a fresh contact check, success/error toasts and
 * leaving the picker once the contact lists are refreshed.
 */
export const useContactConnection = <TRecord, TVariables, TSaved>({
  loadRecord,
  getUpdate,
  save,
  refreshLists,
  reloadCandidates,
  onConnected,
  messages,
}: ContactConnectionOptions<TRecord, TVariables, TSaved>): {
  connecting: boolean;
  connect: (id: string) => Promise<void>;
} => {
  const { toast } = useToast();
  const [connecting, setConnecting] = useState(false);
  // A ref, unlike state, also blocks a second click before the next render.
  const saving = useRef(false);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const connect = async (id: string): Promise<void> => {
    if (saving.current) return;
    saving.current = true;
    setConnecting(true);
    try {
      const record = await loadRecord(id);
      const variables = record ? getUpdate(record) : null;
      if (!record || !variables) {
        toast({
          title: messages.cannotConnectTitle,
          description: messages.cannotConnectDescription,
          variant: 'destructive',
        });
        // A failed reload shows in the picker's error state, not a second toast.
        void reloadCandidates().catch(() => undefined);
        return;
      }
      const saved = await save(record, variables);
      if (!saved) throw new Error(messages.failed);
      const refreshed = await finishContactConnection(
        () => refreshLists(record, saved),
        () => {
          if (mounted.current) onConnected();
        },
      );
      toast({
        title: messages.connected,
        description: refreshed ? undefined : messages.refreshFailed,
      });
    } catch (connectionError) {
      toast({
        title: messages.failed,
        description:
          connectionError instanceof Error
            ? connectionError.message
            : undefined,
        variant: 'destructive',
      });
    } finally {
      saving.current = false;
      if (mounted.current) setConnecting(false);
    }
  };

  return { connecting, connect };
};
