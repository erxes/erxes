import { createContext, useContext } from 'react';

/**
 * The thread id of the transcript currently rendered. Reference chips read
 * it so a click inside the full `/agent` page can reopen the same thread in
 * the side panel ("continue in side panel").
 */
export const AgentChatThreadContext = createContext<string | undefined>(
  undefined,
);

export const useAgentChatThreadId = () => useContext(AgentChatThreadContext);
