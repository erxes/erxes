import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { MASTRA_SETTINGS } from '~/graphql/queries';
import { MASTRA_KNOWLEDGE_SYNC } from '~/graphql/mutations';

/**
 * "Sync now" action for company knowledge. Indexing runs AS the clicking user
 * (Agent = Person); erxes enforces their permissions.
 */
export const useKnowledgeSync = () => {
  const [syncKnowledge, { loading: syncing }] = useMutation(
    MASTRA_KNOWLEDGE_SYNC,
    { refetchQueries: [{ query: MASTRA_SETTINGS }] },
  );
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const handleKnowledgeSync = async () => {
    setSyncMsg(null);
    try {
      await syncKnowledge();
      setSyncMsg(
        'Indexing started as you — reload in a moment to see updated status.',
      );
    } catch (err) {
      setSyncMsg(
        err instanceof Error ? err.message : 'Failed to start indexing.',
      );
    }
  };

  return { handleKnowledgeSync, syncing, syncMsg };
};
