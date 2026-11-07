# Studymate: an AI study partner for erxes

Studymate is an erxes plugin that helps university students prepare for exams, powered by **Gemma 4**.

## What it does

- **Tutor chat:** explains topics step by step, checks understanding with questions, and answers in Mongolian or English. Answers stream in as they are written. Link a study plan and the tutor knows your schedule and weak topics.
- **Study plans:** enter a subject, exam date, daily study time and topics. You get a day-by-day schedule with spaced reviews and a practice exam at the end. Tick off sessions, track progress, and move missed sessions with one click.
- **Quizzes and practice:** multiple-choice quizzes (graded on the server) and exam-style problems with worked solutions. There's a "Quiz me" button on every session, and topic strength bars show your weak spots.
- **Example exams:** upload a past paper (photos, PDF or text). Gemma rates its difficulty and question style, and your quizzes match it, or go easier or harder. Files are never stored.

## How it works

```
Browser → Core UI (3001) → studymate_ui → Gateway (4000) → studymate_api → MongoDB
                                                                        → Gemma 4 (Gemini API or Ollama)
```

- The API key stays on the server. The browser never talks to Gemma.
- Slow AI work runs in the background: the API saves a status, answers immediately, and the UI polls. A long answer can't time out a request.
- Gemma's output is always validated before saving: JSON is extracted, checked and cleaned, and retried once if unusable.
- Plans are fast because Gemma only describes the topics. The calendar is built in code (`services/scheduler.ts`), which also guarantees the daily time limit.

## Setup

Requirements: the erxes local setup (Node 22, pnpm, MongoDB replica set, Redis) and a Gemini API key from Google AI Studio.

1. Add to `.env` in the erxes root:
   ```
   ENABLED_PLUGINS=sales,studymate
   STUDYMATE_AI_PROVIDER=gemini
   GEMMA_MODEL=gemma-4-26b-a4b-it
   GEMINI_API_KEY=your-key
   ```
2. Start erxes: `./erxes.sh api` and `./erxes.sh ui` (or `pnpm dev:apis` and `pnpm dev:uis`).
3. Open http://localhost:3001 and choose **Studymate** in the menu.

To run Gemma locally instead, set `STUDYMATE_AI_PROVIDER=ollama`, `GEMMA_MODEL=<name from ollama list>` and `OLLAMA_URL=http://127.0.0.1:11434`.

## Code layout

- `backend/plugins/studymate_api/src/modules/studymate/`
  - `ai/` contains the Gemma client, prompts, and JSON checking.
  - `services/` contains the planner, scheduler, quizzes, exam samples, chat, and serialization.
  - `graphql/` contains the schema and resolvers.
- `frontend/plugins/studymate_ui/src/modules/studymate/`
  - `components/` contains the screens.
  - `graphql.ts`, `styles.ts` and `files.ts` hold the queries, the styles, and file preparation.

MongoDB collections: `studymate_conversations`, `studymate_plans`, `studymate_quizzes`, `studymate_exam_samples`.

## Team

- Name 1: role
- Name 2: role
- Name 3: role

See `CREDITS.md` for third-party code and services.
