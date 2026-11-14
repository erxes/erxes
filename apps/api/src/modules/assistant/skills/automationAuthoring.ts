import type { Skill } from './skills';

export const AUTOMATION_SKILL: Skill = {
  name: 'author-automation',
  description:
    'Create or change an automation (a trigger and the steps it runs) from a description, saved as a draft the member turns on.',
  instructions: `Use this whenever the member asks to create, build or change an automation, in any language.

1. Read what exists with callApi: automations.catalog lists the triggers (event types and their subject) and the actions (with their input fields, which are required, and their options); automations.fields(subject) lists the paths conditions and placeholders can read and how their values compare; automations.templates has ready-made automations to start from. Use only trigger events and action types from the catalog. If nothing fits, say so instead of inventing one.
2. Write the definition: { trigger, steps, reentry, goal?, maxRunsPerHour? }.
   - trigger: { kind: "event", event, conditions? } when something happens; { kind: "schedule", every: "hour" | "day" | "week" | "month", at: "HH:MM", timezone, weekdays?, dayOfMonth?, audience? }; { kind: "date", subject, field: "birthDate" or a date custom field's id, offsetDays, yearly } around a date on each record; { kind: "manual", audience? } when a member starts it. An audience is { type: "customer" | "company", conditions? }.
   - conditions: { match: "all" | "any", rules: [ { path, op, value } or a nested group ] }. Paths come from automations.fields (event.*, subject.*, steps.<id>.output.*). Operators: eq, neq, gt, gte, lt, lte, contains, not_contains, starts_with, in, not_in, exists, not_exists, and for dates within_last, more_than_ago, within_next, anniversary_within with the value { amount, unit: "days" | "weeks" | "months" }. Leave value out for exists and not_exists.
   - steps, each with a unique id of letters and digits (at most 24) and an optional label: { type: "action", action, input } with every required field of the action; { type: "delay", amount, unit: "minutes" | "hours" | "days" } or { type: "delay", until }; { type: "wait_for", event, conditions?, amount, unit }; { type: "branch", conditions, then: [...], else: [...] }; { type: "switch", cases: [ { conditions, steps } ], otherwise: [...] }; { type: "split", paths: [ { weight, steps } ] } with two to five paths for an A/B test; { type: "stop" }.
   - Text in an action's input may use placeholders written like {{subject.firstName}}, with a fallback {{subject.firstName | default: "there"}}. Use only paths automations.fields lists.
   - reentry: "always", "once" or "daily" for how often the same record may run through again. goal: conditions that end the run once they hold.
3. Never invent values that point at workspace records: tag, member, product or company ids, email senders, custom field ids. Look them up with searchApi and callApi. Use the only match; ask with ask_user when there are several; say what to set up first when there is none.
4. Check the whole definition with automations.check before saving and fix every problem it lists. A problem only the member can settle goes to ask_user.
5. Save a new automation with automations.create (name, a one-line description, definition). It is saved as a draft and stays off. Change an existing automation with automations.update only while it is a draft or paused: an active automation publishes a change at once, so tell the member and leave it for the builder.
6. Never turn an automation on, pause it or start a run. Turning it on is the member's decision, made in the builder after they review it.
7. If saving is refused, fix what the error names and try once more; after that, explain what is missing instead of retrying.
8. Reply briefly: what the automation does, anything the member still has to fill in, that it is a draft to review and turn on, and the automation's reference.`,
};
