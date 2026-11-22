import { BROADCAST_PLACEHOLDERS } from '@erxes/core-contract';
import type { Skill } from './skills';

const PLACEHOLDERS = BROADCAST_PLACEHOLDERS.join(', ');

export const BROADCAST_SKILL: Skill = {
  name: 'draft-broadcast',
  description:
    "Write or change a broadcast's subject, message and audience (email or SMS to many customers), left as a draft the member sends.",
  instructions: `Use this whenever the member asks to write, draft, improve or retarget a broadcast, in any language.

1. Read the broadcast with callApi broadcasts.get({ id }). Its channel ("email" or "sms") decides what you write. Change only a broadcast whose status is "draft", "scheduled" or "recurring"; once it has started, say so and change nothing. To start a new one, broadcasts.create({ name, channel }) saves a draft.
2. Write with broadcasts.update({ id, ...fields }), sending only the fields you change:
   - email: subject and preheader (one line each, at most 200 characters), and content, the whole message as the email editor's document: { type: "doc", content: [...] } with nodes such as heading (attrs.level 1-3), paragraph, text (text, marks bold, italic, link with attrs.href), bulletList > listItem > paragraph, button (attrs.text, attrs.url), image (attrs.src, an https address), horizontalRule and spacer. Links are http(s), mailto: or tel: only; no raw HTML. content replaces the message, so start from the one broadcasts.get returned and keep what the member did not ask to change. The plain-text part is made from it.
   - sms: body, the text (keep it short; one SMS is 160 characters).
3. Personalise only with these fields: ${PLACEHOLDERS}. In email content a field is a node { type: "variable", attrs: { id: "firstName", fallback: "there" } }; in a subject, preheader or SMS body it is written {{ firstName | there }}. Give every field a fallback (up to 100 characters, without { } or |) so a customer missing the value reads naturally. A name outside the list is refused with UNKNOWN_PLACEHOLDER.
4. Audience: a saved view (viewId; views.list({ recordType: "customer" })) or a filter, not both; neither means every customer. A filter is { match: "all" | "any", rules: [ { path, op, value } ] } with paths from views.fields({ recordType: "customer" }). Check who it reaches with broadcasts.audience({ channel, viewId or filter }) and tell the member the reachable count. Never invent tag, view or custom field ids: look them up, ask the member with a form when there are several matches.
5. broadcasts.preview({ id }) shows the message as one customer gets it; use it to check fields and fallbacks.
6. Never send, test, schedule, start, resume or cancel a broadcast or its repeat schedule. Sending is the member's decision, made on the broadcast's page after they review it.
7. If saving is refused, fix what the error names and try once more; after that, explain what is missing instead of retrying.
8. Reply briefly: what you changed, the audience's reachable count, anything the member still has to fill in (a sender, a Reply-To), and that the draft is ready for them to review and send.`,
};
