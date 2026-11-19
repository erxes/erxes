import type { Skill } from './skills';

export const INTEGRATION_SKILL: Skill = {
  name: 'author-integration',
  description:
    "Connect an outside service that has no ready-made integration, or add an action or an incoming event to one: a custom integration whose programs call the service's API.",
  instructions: `Use this when the member asks to connect a service erxes has no integration for, to call its API from an automation, or to react to its webhooks.

1. Read what exists with callApi: integrations.list, then integrations.get(id) for its hosts, its sealedNames and its programs. Reuse an integration of that service instead of adding a second one.
2. A new service: integrations.create with key (lower case letters, digits and _; it names the action and event types and cannot change), name and hosts: the exact host names of the service's API (api.example.com), nothing wider. Read the service's API reference first if you are not sure of the host or the request shape; never guess an address.
3. You never see, ask for or store the service's key. After integrations.create, tell the member to open Settings › Integrations › the integration and add the key there under a name you give them (apiKey). Do not ask for it in chat; if the member pastes a key into the chat, tell them to add it in settings and to rotate it. You cannot change hosts or remove an integration: those are the member's.
4. Write a program with integrations.saveProgram (integrationId, kind, key, label, description, code, and fields, outputs or events). It replaces the program of that kind and key and is live at once, so check it with integrations.testProgram before you say it works. The code is the body of an async JavaScript function with no network, files, timers or imports. It reaches the service only through:
   - await request({ method, url, headers, query, body }): url is a path on the first host ("/boats") or a full https address on one of the integration's hosts; any other host is refused. A body that is an object is sent as JSON. It answers { status, headers, body }, with body parsed when the service answers JSON. It never throws on a 4xx or 5xx: check status and throw new Error(...) with the service's message so the step fails and retries.
   - Write a sealed value as {{secret.<name>}} inside a header, a query value, the url or the body ("Bearer {{secret.apiKey}}"). The server fills it in; the program only ever holds the placeholder.
   - await verify(signature, payload, name, encoding): whether signature is the HMAC-SHA256 of payload under the sealed value name; encoding is "hex" (default) or "base64", and a leading "sha256=" is ignored.
   - await equals(value, name): whether value is the sealed value name, for services that send a shared token.
   - console.log lines come back from integrations.testProgram.
   A run stops after 10 seconds or 50 calls and returns at most 20000 characters.
5. kind "action" is a step automations run, of type integrations.<integration key>.<key>. fields are its inputs ({ key, label, type: "text" | "longtext" | "number" | "boolean" | "date" | "select" | "json", required, options?, description? }), read in the code as input.<key>. outputs ({ key, label, type }) name what the returned object holds for later steps. A step may run more than once: send idempotencyKey (a global) to a service that takes one. Return a small object, not the service's whole answer.
6. kind "incoming" answers the service's calls at the program's address (integrations.get shows it; give it to the member to paste into the service's webhook settings). The code reads incoming.method, incoming.headers (lower case names), incoming.query, incoming.rawBody and incoming.body (parsed JSON, or the text). Always check the caller first with verify or equals and return null when it fails. Return { event, payload, dedupeKey } or a list of them: event is the key of one of the program's events ({ key, label, fields }), published as integrations.<integration key>.<key>; dedupeKey is the service's own id for the call, so a repeat publishes nothing.
   outputs and each event's fields are the contract automations build on before anything has happened: declare them from the service's API reference, so a member can use the data at once. When a real answer or call carries other keys or another kind of value, core adds and corrects them by itself; an event the code publishes without declaring it is added the same way.
7. To do something in the service for the member right now, outside an automation, run the action with integrations.testProgram and its input, and tell them what came back.
   Test with integrations.testProgram (id, input for an action, incoming for an incoming program). A test calls the real service: use input that is safe to send, and tell the member what it did. A sealed value that is missing fails with its name: ask the member to add it.
8. To use an action or an event in an automation, load author-automation: the action and the event are in automations.catalog once saved.
9. Reply briefly: what was added, what the member still has to do (add the key, paste the address), and what the test showed.`,
};
