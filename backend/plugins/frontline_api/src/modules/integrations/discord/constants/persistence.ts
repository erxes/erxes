// How many find→create/wait rounds getOrCreateCustomer runs before treating a
// still-unlinked row as abandoned and taking its core sync over. The sync is a
// single in-process bridge call, so the backed-off waits (250ms × attempt,
// ~2.5s total) are generous for a live peer.
export const CUSTOMER_CREATE_ATTEMPTS = 4;

// How many backed-off re-reads a conversation-create-race loser gives the winner
// to land the core `erxesApiId` link before syncing the adopted row itself.
// Mirrors CUSTOMER_CREATE_ATTEMPTS (~2.5s total): syncing is a single in-process
// bridge call, so this is generous for a live peer. Without the wait, both first
// messages for a key would each mint (and orphan) a separate core conversation.
export const CONVERSATION_LINK_ATTEMPTS = 4;
