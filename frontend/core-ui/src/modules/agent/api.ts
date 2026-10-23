import { REACT_APP_API_URL } from 'erxes-ui';

/** Base URL for the agent plugin's REST routes behind the API gateway. */
const AGENTS_BASE_URL = `${REACT_APP_API_URL}/pl:core`;

export const AGENTS_CHAT_URL = `${AGENTS_BASE_URL}/agents/chat`;

export const AGENTS_REFERENCE_RESOLVE_URL = `${AGENTS_BASE_URL}/agents/references/resolve`;
