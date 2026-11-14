# Studymate: an AI study tutor plugin for erxes

Studymate adds a new page to erxes with two tabs:

- **Chat**: a tutor powered by Gemma 4 that explains topics step by step, checks understanding with questions, and answers in Mongolian or English, depending on what the student writes.
- **Study plans**: the student enters a subject, exam date, daily study time and topics. Gemma builds a day-by-day plan. The student ticks off sessions, sees progress, and can move missed sessions to later days with one button.

A chat can be linked to a plan, so the tutor knows the student's schedule ("you have 3 days left and missed kinematics yesterday").

This guide has eight parts:

1. The big picture
2. Getting a Gemini API key
3. Installing
4. Wiring (the four small edits)
5. Running and testing
6. How everything works, file by file
7. Key ideas worth understanding
8. Troubleshooting, using Ollama, and next steps

---

## Part 1: The big picture

```
 Browser (localhost:3001)
   │
   ▼
 Core UI host ──loads──▶ studymate_ui (port 3021, Module Federation remote)
   │                         │ GraphQL requests
   ▼                         ▼
 Gateway (port 4000, Apollo Router) ──routes studymate* operations──▶ studymate_api (port 3321)
                                                                      │            │
                                                                      ▼            ▼
                                                                  MongoDB    Gemma 4 (Gemini API
                                                                             or local Ollama)
```

**studymate_ui** is a React app that erxes loads into its main page. It never talks to Gemma directly. It only sends GraphQL requests to the gateway.

**studymate_api** is a small Node.js service. It registers itself with the gateway when it starts, stores data in MongoDB, and is the only part that talks to Gemma. That matters for security: the API key stays on the server, where the browser can't see it.

**The gateway** combines the GraphQL schemas of all services into one "supergraph", so the frontend sees one API even though core, sales and Studymate are separate services.

---

## Part 2: Getting a Gemini API key

Gemma 4 is an open model from Google. The easiest way to use it is Google's hosted Gemini API, which serves two Gemma 4 models:

- `gemma-4-26b-a4b-it`: a "mixture of experts" model. It has 26B parameters but only uses about 4B for each word it writes, so it's fast. **This is the default.**
- `gemma-4-31b-it`: a larger dense model. It's slower, but can be better at hard explanations.

To get a key:

1. Go to Google AI Studio (aistudio.google.com) and sign in with a Google account.
2. Choose **Get API key** and create a key.
3. Copy it. Treat it like a password: never commit it to Git and never paste it in chats or screenshots.

Gemma on the Gemini API is free, but the usage limits are low. For a student project that's fine. If many people test at once, you may see "free usage limit reached" messages. Part 8 explains how to run Gemma on your own computer with Ollama instead.

---

## Part 3: Installing

Run this from the erxes root folder, in the Ubuntu (WSL) terminal or the Mac Terminal:

```bash
cd ~/erxes
git checkout main && git pull
git checkout -b studymate-plugin
bash ~/studymate/install-studymate.sh
```

(Use the folder you unzipped the package into. If you unzipped it in Windows Downloads, it's something like `/mnt/c/Users/<you>/Downloads/studymate`.)

The script does five things:

1. **Creates the plugin skeleton** with erxes' own generator: `pnpm create-plugin --plugin-name=studymate --module-name=sample`. The generator writes all the boring plumbing that has to match erxes exactly: startup code, Module Federation config, build config, and the files that connect modules to the server. The sample module is named `sample` on purpose, so it can't clash with our `studymate` module.
2. **Fixes the ports.** The generator always uses API port 33010 and UI port 3005, which belong to other plugins. The script changes them to 3321 and 3021, after checking that no other plugin uses those numbers. To use different ports, run it like this: `STUDYMATE_API_PORT=3330 STUDYMATE_UI_PORT=3030 bash install-studymate.sh`.
3. **Copies the Studymate code** into `backend/plugins/studymate_api/src/modules/studymate/` and `frontend/plugins/studymate_ui/src/modules/studymate/`, plus an `AGENTS.md` for each project (the erxes repo requires one) and this guide.
4. **Edits `.env`:** it adds `studymate` to `ENABLED_PLUGINS` and adds `STUDYMATE_AI_PROVIDER=gemini`, `GEMMA_MODEL=gemma-4-26b-a4b-it` and an empty `GEMINI_API_KEY=`.
5. **Runs `pnpm install`**, so the new projects are linked into the workspace.

Now put your key in `.env`:

```bash
nano .env
```

Find the line `GEMINI_API_KEY=` and paste your key after the `=`, with no spaces or quotes. Save with Ctrl+O, Enter, Ctrl+X.

Everyone on the team uses their own key in their own `.env`. Keys never go into Git, and `.env` is already ignored.

---

## Part 4: Wiring (the four small edits)

The Studymate code is complete, but erxes doesn't know about it yet. Three backend files and one frontend file need a few lines each. These files were written by the generator, so they're slightly different between erxes versions. The rule is always the same: **find where the `sample` module is added, and add `studymate` right next to it, the same way.**

Everything you need is exported from one file, `src/modules/studymate/index.ts`, so every edit imports from `./modules/studymate` (or `../../modules/studymate`, depending on where the file is).

### Edit 1: register the database models (`backend/plugins/studymate_api/src/connectionResolvers.ts`)

This file builds the `models` object that every resolver receives. erxes calls `loadClasses(db, subdomain)` once per organization (tenant) with that organization's database connection.

Add the import at the top:

```ts
import { IStudymateModels, loadStudymateModels } from './modules/studymate';
```

Make the `IModels` interface include our models by adding `extends IStudymateModels`:

```ts
export interface IModels extends IStudymateModels {
  // ...the lines that are already here stay as they are
}
```

Inside `loadClasses`, just before `return models;`, add:

```ts
  Object.assign(models, loadStudymateModels(db));
```

`Object.assign` copies `StudyConversations` and `StudyPlans` onto the existing models object. Now every resolver can use `models.StudyPlans`.

### Edit 2: add the GraphQL types (the apollo schema file)

Look in `backend/plugins/studymate_api/src/apollo/`. One file collects every module's `types`, `queries` and `mutations` strings. It's usually `schema/schema.ts`, and sometimes `typeDefs.ts`. You'll recognise it because it imports from `modules/sample/graphql/schemas`.

Add the import (adjust `../../` to match the file's folder):

```ts
import { studymateTypes, studymateQueryDefs, studymateMutationDefs } from '../../modules/studymate';
```

Then add each string next to the sample module's matching one, inside the existing template strings. For example, if the file looks like this (your import names may differ):

```ts
export const types = `
  ${SampleTypes}
`;
export const queries = `
  ${SampleQueries}
`;
export const mutations = `
  ${SampleMutations}
`;
```

change it to:

```ts
export const types = `
  ${SampleTypes}
  ${studymateTypes}
`;
export const queries = `
  ${SampleQueries}
  ${studymateQueryDefs}
`;
export const mutations = `
  ${SampleMutations}
  ${studymateMutationDefs}
`;
```

If the file instead builds one big string with `extend type Query { ... }`, put `${studymateTypes}` with the other types, `${studymateQueryDefs}` inside the `Query` braces, and `${studymateMutationDefs}` inside the `Mutation` braces.

### Edit 3: add the resolvers (`src/apollo/resolvers/`)

There's a queries file and a mutations file, usually `queries.ts` and `mutations.ts`, which spread each module's resolvers into one object. Add ours.

In the queries file:

```ts
import { studymateQueries } from '../../modules/studymate';

export const queries = {
  // ...the sample module's queries that are already here
  ...studymateQueries,
};
```

In the mutations file:

```ts
import { studymateMutations } from '../../modules/studymate';

export const mutations = {
  // ...existing mutations
  ...studymateMutations,
};
```

Keep the existing names. If the object there is called something else, add the spread inside that object.

### Edit 4: show the screen (`frontend/plugins/studymate_ui/src/modules/StudymateMain.tsx`)

The generator made a main component that the Core UI loads. It currently shows the sample page (`pages/sample/IndexPage`). Make it show Studymate instead.

Add the import:

```tsx
import { StudymateApp } from './studymate';
```

Then replace the sample page with `<StudymateApp />`. If the file has routes, change the element of the main route:

```tsx
<Route path="/" element={<StudymateApp />} />
```

If it returns a page component directly, return `<StudymateApp />` instead.

**Don't change how the component is exported** (its name, or default vs named). `module-federation.config.ts` exposes it by that name, and the Core UI loads it that way.

If the Studymate screen appears squashed with no height, wrap it: `<div className="h-full"><StudymateApp /></div>`.

### Optional: removing the sample module

Once Studymate works, you can delete the generator's sample code. On the backend, remove the `sample` lines from the three wiring files, then delete `src/modules/sample`. On the frontend, remove the sample route or page, then delete `src/pages/sample`. Do this in a separate commit, so it's easy to undo if something breaks.

---

## Part 5: Running and testing

Restart both processes, since `.env` and the plugin list changed:

```bash
./erxes.sh api     # terminal 1
./erxes.sh ui      # terminal 2
```

In the API terminal, look for:

- `studymate graphql api ready at http://localhost:3321/graphql`
- `Plugin studymate joined service discovery`
- `Router started successfully`

Then check it builds and passes lint:

```bash
pnpm nx lint studymate_api && pnpm nx build studymate_api
pnpm nx lint studymate_ui && pnpm nx build studymate_ui
```

Open http://localhost:3001 and find Studymate in the navigation. Then test, in this order:

1. **Status line:** under the tabs it should say "Powered by gemma-4-26b-a4b-it via the Gemini API". If you see a yellow "not set up" box instead, the key is missing from `.env`, or you didn't restart.
2. **Chat:** ask "Explain Newton's second law with an example". You should see "Studymate is thinking…", then the answer. Try a follow-up question, which tests that history is sent.
3. **Language:** write a question in Mongolian. The answer should be in Mongolian.
4. **Plan:** create a plan for an exam about 10 days away, at 2 h/day, with 4 topics. You'll see "Gemma is building your plan…", then sessions grouped by day.
5. **Tick off** a session. The progress bar moves.
6. **Link:** press "Ask Studymate about this plan" and ask "What should I study today?". The answer should mention today's sessions.
7. **Errors:** remove the key from `.env`, restart, and send a message. You should get a clear error, not a crash. Put the key back afterwards.

To test rescheduling without waiting for a day to pass, temporarily change a session's date to yesterday in MongoDB:

```bash
docker exec -it erxes-mongo mongosh erxes --eval 'db.studymate_plans.updateOne({}, {$set: {"sessions.0.date": "2020-01-01"}})'
```

The plan then shows 1 missed session. Press **Reschedule missed sessions** and it moves to the next day with free time.

---

## Part 6: How everything works, file by file

### How a chat message travels

1. The student types and presses Enter. `ChatView` immediately shows the text as a lighter bubble (`pendingText`), so the screen reacts instantly.
2. `ChatView` runs the `studymateChatSend` mutation with the conversation id (empty for a new chat), the linked plan id, and the text.
3. The gateway forwards it to `studymate_api`. The resolver in `mutations.ts`:
   - checks the user is logged in (`requireUserId`)
   - checks the message isn't empty or too long
   - checks that a linked plan belongs to this user
   - saves the message, sets `status: 'thinking'` and `thinkingSince: now`
   - starts `runChatReply(...)` **without waiting for it** (`void`)
   - returns the conversation right away
4. `ChatView` sees `status === 'thinking'` and starts polling the conversation every 1.5 seconds.
5. Meanwhile, `runChatReply` (in `services/chat.ts`) loads the conversation and the linked plan, builds the tutor instructions with `tutorSystemPrompt`, sends the last 20 messages to Gemma through `generateWithGemma`, then saves the reply and sets `status: 'idle'`. If anything fails, it saves `status: 'error'` with a friendly message instead.
6. The next poll returns the new message and `status: 'idle'`. Polling stops, and the answer appears.

### How a plan is made

1. `PlanForm` checks the fields for instant feedback, then runs `studymatePlanGenerate`.
2. The resolver calls `validatePlanInput`. That function trims the subject; checks the date is real and between tomorrow and 120 days away; checks the hours are between 0.5 and 12; removes empty or duplicate topics; and limits notes to 1,000 characters.
3. It saves an empty plan with `status: 'generating'`, starts `runPlanGeneration` in the background, and returns.
4. `runPlanGeneration` calls `generatePlan`, which:
   - sends Gemma the planner instructions (`PLANNER_SYSTEM_PROMPT` and `planPrompt`) with strict rules: dates only inside the study window, a time limit per day, a review at the end, and JSON only
   - pulls the JSON out of the reply with `extractJson`
   - cleans it with `sanitizePlan`
   - if the reply is unusable, asks once more and tells Gemma what was wrong
5. The sessions and tips are saved with `status: 'ready'`. `PlanDetail` was polling every 2 seconds, so it shows the plan right away.

### Backend files (`backend/plugins/studymate_api/src/modules/studymate/`)

**`@types/studymate.ts`** holds the TypeScript shapes of the data:

- `IStudyConversation`, `IStudyMessage`, `IStudyPlan` and `IStudySession` describe what's stored.
- `LeanConversation` and `LeanPlan` describe what `.lean()` returns: plain objects instead of full Mongoose documents. Plain objects are faster and easier to handle.
- `IStudymateModels` is the pair of models the plugin adds to erxes.
- The status types (`'idle' | 'thinking' | 'error'` and so on) mean TypeScript catches typos like `'thinkng'`.

**`db/definitions/studymate.ts`** holds the Mongoose schemas, which are the rules for each collection:

- `messageSchema` uses `_id: false`, because messages are only read as part of their chat.
- `sessionSchema` keeps its `_id`, because the UI ticks off one session by id.
- `{ timestamps: true }` adds `createdAt` and `updatedAt` automatically.
- The `index(...)` lines make "this user's chats, newest first" fast even with lots of data.

**`db/models/Studymate.ts`** contains `loadStudymateModels(db)`, which creates the two models on the given connection. The collections are named `studymate_conversations` and `studymate_plans`, with a prefix so they can never clash with core collections. If a model already exists on that connection, it's reused, because registering the same name twice throws `OverwriteModelError`.

**`ai/gemma.ts`** is the only file that talks to Gemma.

- `getAiConfig()` reads `.env`: which provider, which model, and whether it's configured. The UI uses it for the status line, and it never returns the key.
- `normalizeTurns()` cleans up the history. The Gemini API requires that the conversation starts with a user message and alternates user and model. Trimming history to 20 messages can break that, so this function drops leading model messages and merges two user messages in a row.
- `callGemini()` sends `POST https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent`.
  - The key goes in the `x-goog-api-key` **header**, not the URL, because URLs end up in logs.
  - The tutor instructions are placed at the top of the first user message. Gemma models on the Gemini API don't all accept a separate system instruction, so this method works everywhere.
  - `generationConfig` sets `temperature` (how creative the answers are: 0.7 for chat, 0.4 for plans, which need to be precise) and `maxOutputTokens`, the length limit.
  - `AbortSignal.timeout(...)` gives up after 2 minutes instead of hanging forever.
  - In the answer, `parts` marked `thought: true` are the model's private reasoning and are skipped. Only the real answer text is kept.
- `geminiHttpError()` turns HTTP errors into messages a student understands: 429 means the free limit was reached, 401 or 403 means a bad key, 404 means a wrong model name.
- `callOllama()` does the same for a local Ollama server (`POST /api/chat`). Ollama does support a real system role, so it uses one.
- `GemmaError` carries two messages: a technical one for the server log, and a friendly `userMessage` for the screen.
- `generateWithGemma()` is the single function the rest of the code calls. It picks the provider.

**`ai/prompts.ts`** holds the instructions that shape Gemma's behaviour.

- `tutorSystemPrompt(today, plan)` defines the tutor's personality and rules: explain step by step, guide through homework instead of only giving answers, ask a check question, answer in the student's language, don't guess facts. If a plan is linked, `describePlan` adds the exam date, days left, done and missed counts, and the next 5 sessions.
- `PLANNER_SYSTEM_PROMPT` and `planPrompt(input)` ask for a plan with numbered rules and the exact JSON shape to return. Giving the exact shape is the most reliable way to get usable JSON from a model. `previousProblem` is used on the second try: "your previous answer could not be used (reason)".

**`services/dates.ts`** handles dates. Plans use `"YYYY-MM-DD"` strings (see part 7).

- `todayISO()` returns today in the server's time zone. The `en-CA` locale happens to format dates as `YYYY-MM-DD`.
- `isISODate()` accepts `2026-11-20` and rejects `2026-02-31` by checking that the date survives a round trip.
- `addDays()`, `daysBetween()` and `dateRange()` do the arithmetic in UTC, so daylight saving time can't shift a day.

**`services/planner.ts`** is the brain of the plans.

- `validatePlanInput()` checks the form data (see "How a plan is made" above). `PlanInputError` marks messages that are safe to show the student.
- `extractJson()` finds the JSON in Gemma's reply even if it's wrapped in a code fence or follows a sentence like "Here is your plan:".
- `sanitizePlan()` **never trusts the AI.** It drops sessions with impossible dates or no topic; keeps each duration between 15 minutes and the daily limit; removes empty tasks and keeps at most 6; scales down any day that goes over the daily limit; sorts by date; and keeps at most 5 tips. If nothing usable is left, it throws `PlanFormatError`, which triggers the second attempt.
- `generatePlan()` makes up to 2 attempts, as described above.
- `runPlanGeneration()` is the background job. It always ends by saving either `ready` and the sessions, or `failed` and a friendly error, so the UI never waits forever.
- `rescheduleSessions()` is **plain code, not AI**: it's instant, free and predictable. It counts how many minutes are already planned for each remaining day. Then it takes each missed session, oldest first, and puts it on the earliest day before the exam with enough free time. If no day has room, it uses the least busy day and reports it as overloaded, so the student is warned.

**`services/chat.ts`**

- `makeTitle()` makes the chat title from the first 40 characters of the first message.
- `runChatReply()` is the background job described above. `HISTORY_LIMIT = 20` keeps requests fast and small.

**`services/serialize.ts`** converts database documents into what GraphQL returns.

- Mongo's `_id` objects become strings, and dates become ISO strings like `2026-10-24T05:00:00.000Z`. Otherwise GraphQL would turn a Date into an unreadable number.
- It computes `progress` (by minutes, so a 2-hour session counts more than a 20-minute one), `daysLeft`, `missedCount`, `totalMinutes` and `doneMinutes`.
- `isStale()` handles a subtle problem. The background jobs live inside the API process. If you save a file, `tsx watch` restarts the API, and any running job is lost. Without this check, the chat would say "thinking" forever. Anything still running after 3 minutes is shown as interrupted, with a hint to try again.

**`graphql/schema.ts`** defines the API. All names start with `Studymate` or `studymate`, because every plugin shares one supergraph and duplicate names would break it.

Queries:

- `studymateConversations` returns the chat list (without messages, to keep it fast).
- `studymateConversationDetail(_id)` returns one chat.
- `studymatePlans` and `studymatePlanDetail(_id)` do the same for plans.
- `studymateAiStatus` returns the provider, model, and whether it's configured.

Mutations:

- `studymateChatSend` sends a message.
- `studymateConversationRemove` deletes a chat.
- `studymatePlanGenerate` creates a plan.
- `studymatePlanRetry` retries a failed plan.
- `studymateSessionToggle` ticks or unticks a session.
- `studymatePlanReschedule` moves missed sessions and returns the plan, how many moved, and any overloaded days.
- `studymatePlanRemove` deletes a plan and unlinks it from chats.

**`graphql/resolvers/context.ts`**

- `StudymateContext` declares only the parts of erxes' context that Studymate uses (`models`, `user`), which keeps the module independent.
- `requireUserId()` blocks anyone who isn't logged in.
- `assertId()` checks the id format first, so a bad id returns "not found" instead of a confusing Mongo error.

**`graphql/resolvers/queries.ts`**: every query filters by `userId`, so you can never read someone else's chat, even by guessing an id.

**`graphql/resolvers/mutations.ts`**

- `studymateChatSend` and `studymatePlanGenerate` follow the "save, start in the background, return now" pattern.
- `studymateSessionToggle` uses Mongo's **positional operator**: `'sessions._id': id` finds the plan that contains the session, and `'sessions.$.done'` updates just that one session inside the array. That's one quick database operation, and nothing else is loaded or rewritten.
- `studymatePlanRetry` refuses plans that are ready or still running, and restarts from today.
- `studymatePlanReschedule` only saves when something actually moved.
- `studymatePlanRemove` also clears `planId` from any chats that were linked to the deleted plan.

**`index.ts`** gathers in one place everything the wiring files need.

### Frontend files (`frontend/plugins/studymate_ui/src/modules/studymate/`)

**`types.ts`** contains TypeScript copies of the GraphQL types, so components know the field names.

**`graphql.ts`** holds the queries and mutations, written with `gql`.

- **Fragments** (`StudymatePlanSummary`, `StudymatePlanFull`, `StudymateConversationFull`) are named field lists reused everywhere.
- Because every mutation returns the full plan with its `_id`, Apollo's cache recognises it and updates every screen showing that plan automatically. That's why ticking a session updates the progress bar without extra code.

**`utils.ts`**

- `todayLocal()` returns the browser's date as `YYYY-MM-DD`, to mark "Today" and "Missed".
- `formatDay()` turns `2026-11-20` into "Fri, Nov 20".
- `formatMinutes()` turns 90 into "1 h 30 min".
- `groupByDate()` puts sessions under their day.
- `errorText()` pulls the backend's message out of Apollo's error wrapper.

**`components/StudymateApp.tsx`** is the page with the two tabs.

- The tabs are React state rather than URLs, so the plugin works under whatever route erxes gives it.
- Both tabs stay mounted (one is just `hidden`), so switching tabs doesn't lose a half-typed message.
- `askTutorAboutPlan` switches to Chat with the plan linked. Changing `chatKey` remounts `ChatView`, so it starts a fresh chat.

**`components/AiStatusBanner.tsx`** shows the model in use, or a yellow warning telling you what's missing in `.env`.

**`components/ChatView.tsx`**

- The left column is the chat list, with a "New chat" button and delete on hover.
- The main column is the plan selector, the messages, and the input box.
- Polling uses `startPolling(1500)` and `stopPolling()` in a `useEffect` that depends on `thinking`. Whenever `thinking` changes, the effect runs again and turns polling on or off.
- `pendingText` is the optimistic bubble. If sending fails, the text is put back in the box so nothing is lost.
- Enter sends, and Shift+Enter adds a new line.
- `bottomRef.scrollIntoView` keeps the newest message visible.
- `whitespace-pre-wrap` keeps Gemma's line breaks and lists readable without a Markdown library.

**`components/PlansView.tsx`**

- It shows the plan list (polling every 3 seconds while any plan is generating), the "New plan" button, and either the form or the selected plan.
- The newest plan opens automatically.

**`components/PlanForm.tsx`** is the form.

- Topics are one per line.
- The browser checks the fields for speed, but the server checks again, because anyone can call the API directly.
- `refetchQueries` reloads the list so the new plan appears at once.

**`components/PlanDetail.tsx`**

- It shows the header with exam date, days left and hours per day, plus the progress bar.
- It shows status boxes: "building", "failed" with **Retry**, and "missed sessions" with **Reschedule**.
- It shows tips, then sessions grouped by day with checkboxes. "Today" is highlighted, and missed sessions are marked in red.
- It polls every 2 seconds while generating.
- Delete waits for the refreshed list (`awaitRefetchQueries`), so the deleted plan isn't reopened.

**`index.ts`** exports `StudymateApp` for the main page (Edit 4).

### Other files in the package

- `AGENTS.md` (one in each project) is the per-project summary that the erxes repo requires, with its sections in the required order.
- `install-studymate.sh` is the installer from part 3.

---

## Part 7: Key ideas worth understanding

**Never wait for AI inside a request.** AI answers can take 10 to 60 seconds. The gateway and browser have time limits, so a long request can fail even though Gemma is fine. Studymate saves a status (`thinking` or `generating`), returns immediately, does the work in the background, and the UI polls. This "job + status + polling" pattern is common in real products. The next step up would be a queue (BullMQ, which erxes already uses) or GraphQL subscriptions instead of polling.

**Never trust model output.** Gemma is good, but it can return a date outside the window, 900-minute sessions, or broken JSON. Everything it returns goes through `extractJson` and `sanitizePlan` before it's saved. The same rule applies to user input: the frontend checks for convenience, and the backend checks for safety.

**Prompts are code.** The tutor's behaviour comes from `tutorSystemPrompt`. Want it to always give a practice problem at the end? Add a rule there. Changing prompts is the fastest way to improve the product. Test each change with the same few questions, so you can compare.

**Calendar days are strings.** A study day is a date on the calendar, not a moment in time. Stored as a `Date`, "Nov 20 00:00 in Ulaanbaatar" becomes "Nov 19" in UTC, and the plan shifts by a day. `YYYY-MM-DD` strings avoid that completely, and they sort correctly as plain text.

**Every query is scoped to the user.** Every database call includes `userId`. That stops one student from reading another's chats by guessing an id. erxes also scopes `models` to the organization (tenant), so organizations are separated too.

**Prefix everything.** The GraphQL names (`Studymate...` and `studymate...`) and collection names (`studymate_...`) all have a prefix, because all plugins share one supergraph and one database. A name clash would break the gateway for everyone.

**Secrets stay on the server.** The key is read from `.env` by the backend only, sent in a header, and never logged or returned. If it were in the frontend, anyone could copy it from the browser's developer tools.

---

## Part 8: Troubleshooting, Ollama, and next steps

### Common problems

- **The yellow "Gemma is not set up yet" box:** `GEMINI_API_KEY` is empty, or the backend wasn't restarted. Run `grep GEMINI .env` to check, without sharing the output, then restart with `./erxes.sh api`.
- **"free usage limit was reached":** the Gemini free tier has low limits for Gemma. Wait a minute. For heavy testing, use Ollama (below).
- **"API key is invalid":** create a new key in AI Studio and paste it again, with no spaces or quotes.
- **"model was not found":** check `GEMMA_MODEL`. On the Gemini API, it's `gemma-4-26b-a4b-it` or `gemma-4-31b-it`.
- **The supergraph fails to compose and mentions a `Studymate...` type:** Edit 2 added the types twice, or put a query inside the types block. Check the schema file.
- **`Cannot read properties of undefined (reading 'find')`:** Edit 1 is missing, so `models.StudyPlans` doesn't exist.
- **`Cannot query field "studymatePlans" on type "Query"`:** Edit 2 or Edit 3 is missing, or the API didn't restart.
- **The Studymate menu item is there but the page is blank:** check Edit 4 and the browser console (F12). Also check that `config.tsx` and `module-federation.config.ts` still use the names the generator made.
- **`EADDRINUSE`:** the port is taken. Rerun the installer with other ports, or check for leftover processes with `./erxes.sh stop`.
- **"Studymate is thinking…" never ends:** check the API terminal for `[studymate]` errors. After 3 minutes it turns into an "interrupted" message automatically.
- **The UI shows TypeScript errors in the wiring files:** paste the error and the generated file, and it can be adjusted. The generated files differ a little between erxes versions.

### Using Ollama (free, no limits, runs on your computer)

This needs a strong computer with plenty of RAM. Gemma 4 is a large model.

1. Install Ollama inside the same environment as erxes. In WSL Ubuntu, that's `curl -fsSL https://ollama.com/install.sh | sh`. On a Mac, use the app from ollama.com.
2. Find the Gemma 4 model name in Ollama's model library, then download it with `ollama pull <name>`. Check the exact name with `ollama list`.
3. In `.env`:
   ```
   STUDYMATE_AI_PROVIDER=ollama
   GEMMA_MODEL=<the exact name from ollama list>
   OLLAMA_URL=http://127.0.0.1:11434
   ```
4. Restart the API.

### Splitting the work in your team

- **Backend person:** the wiring edits; plan statistics (for example, a streak of days in a row); permissions in `meta/permissions.ts` if you want only some users to have access.
- **AI person:** improve the prompts; add a "quiz me" mode (a mutation that asks Gemma for 5 multiple-choice questions as JSON, validated like plans); reply streaming.
- **Frontend person:** replace the plain Tailwind elements with `erxes-ui` components so Studymate matches the rest of erxes; support dark mode; render Markdown in answers; build a calendar view.

### Ideas for next versions

- Quiz mode, using Gemma to generate questions from the plan's topics.
- Daily reminders through erxes automations: "You have 2 sessions today".
- Upload lecture notes (PDF) and let the tutor answer from them.
- An "Explain this session" button on each session, which opens a chat about that topic.
