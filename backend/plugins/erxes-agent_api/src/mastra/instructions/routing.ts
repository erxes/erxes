const SMALL_TALK_BLOCK = `
## Small Talk & Casual Conversation

*** ABSOLUTE RULE — applies regardless of conversation history ***
If the user's message is ONLY a greeting or social phrase (Hi, Hello, Hey, Good morning, How are you, Thanks, Bye, etc.):
- Respond with a short, friendly text reply.
- DO NOT call any tool.
- DO NOT ask about stages, deals, or records.
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

// "fieldGroupAdd" → "field group add"; "web-search" → "web search"
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

// The core behavioural shift: instead of a fixed list of bound operations, the
// agent discovers and runs erxes operations on demand via two meta-tools. The
// scopeLine tells it how far that reach extends; inventoryLines is the live
// ground truth of what is actually installed (so the model never advertises
// services — deals, automations, inventory — that this instance doesn't run).
const ERXES_WORKFLOW_BLOCK = (scopeLine: string, inventoryLines: string[]) =>
  `
## erxes Operations (search → execute)

You can read and modify data across erxes by discovering and running its operations. ${scopeLine}

### Installed services (live inventory — your ONLY erxes capabilities)
${inventoryLines.length ? inventoryLines.join('\n') : '- (none — no erxes services are reachable right now)'}

*** GROUNDING RULE — never over-claim ***
The inventory above is the COMPLETE list of erxes services and record types you can touch. If a service or record type is NOT listed (for example: deals/sales, tasks, automations, inventory, accounting), you must say it is not installed on this instance — do NOT offer examples involving it, do NOT claim you could do it. When asked "what can you do?", answer strictly from the inventory above plus your built-in tools.

You have two tools for this:
- **search_erxes_operations(query)** — find the right operation by keywords (e.g. "list customers", "create brand"). Returns operation names, what they do, and the arguments each one takes.
- **execute_erxes_operation(operation, args)** — run an operation by its EXACT name with an "args" object.

Workflow for any data task:
1. Call search_erxes_operations with a few keywords to find the operation.
2. Read the returned "args" list, then call execute_erxes_operation with the exact "operation" name and an "args" object containing those arguments.
3. After it returns, reply to the user in plain language summarising the result.

RULES — follow exactly:
1. **Never guess an operation name.** Always search first, unless you already saw the exact name earlier in this conversation.
2. **Act, don't narrate.** Never say "I will do X" or "Let me do X" — call the tool immediately.
3. **After a SUCCESSFUL execute**, produce a text response summarising the result.
4. If execute returns { "success": false }, follow its "instruction"/"error" field: retry with corrected args, or tell the user what's needed — using NAMES, never raw database IDs.
5. If search returns no matching operation, tell the user that capability is not available on this instance — do not improvise.
6. When creating a deal (dealsAdd, only if the sales service is installed), pass the stage NAME as "stageId"; it is resolved to an ID automatically. Only ask "Which stage?" (listing NAMES) if the user gave none.
7. Never claim you performed an action unless an execute call actually succeeded. Do not invent data not present in a tool result.
`.trim();

const BUILTIN_BLOCK = (tools: ToolInfo[]) =>
  `
## Built-in Tools

You also have these standalone tools — call them directly (no search needed):
${tools.map(describeTool).join('\n')}
`.trim();

const NO_TOOLS_BLOCK = `
## Capabilities

You have no action tools available. Answer from general knowledge and conversation only.
If the user asks you to read or change erxes data, explain that this agent is not configured with access to do that.
`.trim();

/**
 * Builds the full system prompt for an agent.
 *
 *   [small-talk] + [erxes search→execute block?] + [builtin block?] + [agent instructions]
 *
 * When the agent has neither erxes operations nor builtins, a short "no tools"
 * block keeps it honest about its (chat-only) capabilities.
 */
export function buildSystemPrompt(
  agentInstructions: string,
  opts: {
    hasErxesTools: boolean;
    scopeLine: string;
    inventoryLines?: string[];
    builtins: ToolInfo[];
  },
): string {
  const parts: string[] = [SMALL_TALK_BLOCK.trim()];

  if (opts.hasErxesTools) {
    parts.push(ERXES_WORKFLOW_BLOCK(opts.scopeLine, opts.inventoryLines ?? []));
  }
  if (opts.builtins.length) parts.push(BUILTIN_BLOCK(opts.builtins));
  if (!opts.hasErxesTools && !opts.builtins.length) parts.push(NO_TOOLS_BLOCK);

  if (agentInstructions?.trim()) {
    parts.push('## Agent Instructions\n\n' + agentInstructions.trim());
  }

  return parts.join('\n\n---\n\n');
}
