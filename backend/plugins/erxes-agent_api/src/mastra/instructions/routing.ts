const SMALL_TALK_BLOCK = `
## Small Talk & Casual Conversation

*** ABSOLUTE RULE — applies regardless of conversation history ***
If the user's message is ONLY a greeting or social phrase (Hi, Hello, Hey, Good morning, How are you, Thanks, Bye, etc.):
- Respond with a short, friendly text reply.
- DO NOT call any tool. NOT dealsAdd. NOT any other tool.
- DO NOT ask about stages or deals.
- DO NOT use conversation history to assume they want to continue a previous task.

Examples:
  User: Hi            → Hello! How can I help you today?
  User: How are you?  → I'm doing well, thanks for asking. How can I assist?
  User: Good morning  → Good morning! What can I help you with?
  User: Thanks        → You're welcome! Let me know if there's anything else I can help with.
  User: Bye           → Goodbye! Have a great day.
`;

// Metadata for one tool the agent actually has, used to give the model accurate
// awareness of its real capabilities (instead of a bare comma-joined name list).
export interface ToolInfo {
  id: string;
  name: string;
  description?: string;
}

// Matches the auto-generated placeholder descriptions (e.g. "mutation brandsAdd",
// "query users") that carry no real meaning — fall back to a humanized name then.
const GENERIC_DESC = /^(query|mutation)\s+\S+$/i;

// "fieldGroupAdd" → "field group add"; "core-usersChangePassword" → "users change password"
function humanize(name: string): string {
  return (name || '')
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .toLowerCase()
    .trim();
}

function describeTool(t: ToolInfo): string {
  const desc = (t.description || '').trim();
  const readable = desc && !GENERIC_DESC.test(desc) ? desc : humanize(t.name || t.id);
  return `- ${t.name || t.id}: ${readable}`;
}

// Only injected when the agent actually has a dealsAdd tool — otherwise this
// (sales-specific) guidance pollutes the prompt and confuses unrelated agents.
const DEALS_ADD_BLOCK = `
**For dealsAdd specifically:**
- Structure the call as dealsAdd({ stageId: "stage name", name: "deal name" }) — TOP-LEVEL args, no "doc" wrapper.
- stageId accepts the stage NAME from the user's message; the tool resolves names to IDs automatically.
- When the user's message contains a stage name, call dealsAdd immediately — do NOT ask questions first.
- When a tool returns { "success": false } with an availableStages list, follow its "instruction" field exactly; only ask "Which stage?" (listing stage NAMES, never IDs) if the user gave none. Do not explain the failure or show IDs.
`.trim();

const TOOL_ROUTING_BLOCK = (tools: ToolInfo[]) => {
  const hasDealsAdd = tools.some(
    (t) => /dealsadd/i.test(t.id) || /dealsadd/i.test(t.name || ''),
  );
  const toolList = tools.map(describeTool).join('\n');

  return `
## Your Capabilities (Tools)

The tools below are your COMPLETE and ONLY set of capabilities:
${toolList}

*** HARD RULE — never over-claim ***
- Do NOT say or imply you can do anything that is not directly provided by a tool above.
- If the user asks for something none of these tools cover (for example: listing, searching, reading, or viewing records when you only have create/edit tools), clearly say you cannot do that yet, then state what you CAN do — based strictly on the tools listed above.
- Never invent a capability and never imply a tool exists when it does not. When unsure whether you can do something, assume you cannot unless a tool above clearly covers it.

Decision process for every message:
1. Understand what the user wants.
2. Does it map to one of the tools above?
   - YES → call that tool immediately, then follow up with a complete text answer presenting the result.
   - NO, but answerable from general knowledge → reply directly.
   - NO, and not covered by any tool → say you can't do that, and list what you can do.

RULES — follow exactly:
1. **Act, don't narrate.** Never say "I will do X" or "Let me do X" — call the tool immediately.
2. **After a SUCCESSFUL tool call**, produce a text response summarising the result.
3. Never call a tool for greetings, small talk, or questions answerable from general knowledge.
${hasDealsAdd ? '\n' + DEALS_ADD_BLOCK : ''}
`;
};

/**
 * Builds the full system prompt for an agent.
 *
 * When the agent has tools the prompt is:
 *   [small-talk block] + [capabilities/tool block] + [agent-specific instructions]
 *
 * When there are no tools:
 *   [small-talk block] + [agent-specific instructions]
 */
export function buildSystemPrompt(agentInstructions: string, tools: ToolInfo[]): string {
  const parts: string[] = [SMALL_TALK_BLOCK.trim()];

  if (tools.length > 0) {
    parts.push(TOOL_ROUTING_BLOCK(tools).trim());
  }

  if (agentInstructions?.trim()) {
    parts.push('## Agent Instructions\n\n' + agentInstructions.trim());
  }

  return parts.join('\n\n---\n\n');
}
