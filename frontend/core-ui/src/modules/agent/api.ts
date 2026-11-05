import { REACT_APP_API_URL } from 'erxes-ui';

/** Base URL for the agent plugin's REST routes behind the API gateway. */
const AGENTS_BASE_URL = `${REACT_APP_API_URL}/pl:core`;

export const AGENTS_CHAT_URL = `${AGENTS_BASE_URL}/agents/chat`;
export const AGENTS_APPROVE_URL = `${AGENTS_BASE_URL}/agents/approve`;
export const AGENTS_ANSWER_URL = `${AGENTS_BASE_URL}/agents/answer`;
export const AGENTS_CHAT_RECONNECT_URL = `${AGENTS_BASE_URL}/agents/chat/reconnect`;

export const AGENTS_REFERENCE_RESOLVE_URL = `${AGENTS_BASE_URL}/agents/references/resolve`;
