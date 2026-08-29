/**
 * Builds the `.meta()` payload that exposes a tRPC procedure as an
 * agent-callable tool in the /agent-tools manifest.
 *
 * @param description - Agent-facing guidance: when to use the tool, its
 *   input shape, and which other tools it chains with.
 * @param permission - A permission the plugin registers in its
 *   meta/permissions config; checked against the acting user on every call.
 */
export const agentMeta = (
  description: string,
  permission: { module: string; action: string },
) => ({
  agent: { description, permission },
});
