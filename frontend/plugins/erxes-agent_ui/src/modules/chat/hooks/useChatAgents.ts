import { useQuery } from '@apollo/client';
import {
  MASTRA_AGENTS,
  MASTRA_ATTACHMENT_STORAGE_STATUS,
} from '~/graphql/queries';

export interface IChatAgent {
  _id: string;
  agentId: string;
  name: string;
  model?: string;
  provider?: string;
  description?: string;
  isEnabled?: boolean;
  // Full settings — present on the MASTRA_AGENTS payload, used by the in-chat
  // "Edit agent" modal so it can populate without a second fetch.
  instructions?: string;
  toolPolicy?: string;
  allowedTools?: string[];
  destructiveOps?: 'allow' | 'ask';
  memoryEnabled?: boolean;
  maxSteps?: number;
  temperature?: number | null;
}

interface MastraAgentsResponse {
  mastraAgents?: IChatAgent[];
}

interface AttachmentStorageStatusResponse {
  mastraAttachmentStorageStatus?: { enabled?: boolean };
}

// Enabled agents for the chat rail.
export const useChatAgents = () => {
  const { data, loading } = useQuery<MastraAgentsResponse>(MASTRA_AGENTS);
  const agents = (data?.mastraAgents ?? []).filter((a) => a.isEnabled);
  return { agents, loading };
};

// Whether file attachments are usable: instance storage configured AND the
// plugin toggle on. When off, the chat is text-only (no attach button).
export const useAttachmentsEnabled = (): boolean => {
  const { data } = useQuery<AttachmentStorageStatusResponse>(
    MASTRA_ATTACHMENT_STORAGE_STATUS,
  );
  return !!data?.mastraAttachmentStorageStatus?.enabled;
};
