# knowledge-base

Public knowledge base and support portal for erxes, built with Next.js 16 (App
Router), React 19, Tailwind CSS v4 and Apollo Client.

Two references shape it: the visual language follows
[culture.erxes.mn](https://culture.erxes.mn) — purple hero, search, category
cards — while the portal structure follows
[SupportPal](https://demo.supportpal.com/en): the landing page is a support
portal (submit / track a ticket, then collapsible Announcements and
Knowledgebase sections) and search spans articles and announcements together.

All content is read live from the erxes gateway — knowledge base articles from
Frontline, announcements and portal copy from the CMS, tickets from the
Frontline ticket pipeline.

## Running

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev                  # http://localhost:3900
npm run build
npm run lint
```

## Configuration

| Variable | Needed for | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_ERXES_API_URL` | everything | Gateway URL, e.g. `https://officenext.erxes.io/gateway` (no trailing slash) |
| `NEXT_PUBLIC_ERXES_KB_TOPIC_ID` | knowledge base | The Frontline topic to render — the `topicId` in the admin URL |
| `NEXT_PUBLIC_ERXES_CP_TOKEN` | CMS, tickets | Client portal app token; without it every `cp*` CMS query returns "Client portal required" |
| `NEXT_PUBLIC_ERXES_TICKET_PIPELINE_ID` | new tickets | Pipeline client-portal requests land in |
| `NEXT_PUBLIC_ERXES_TICKET_CHANNEL_ID` | new tickets | Channel for those tickets |
| `NEXT_PUBLIC_ERXES_TICKET_STATUS_ID` | new tickets | Status new tickets start at |

The knowledge base needs only the first two: `cpKnowledgeBaseTopicDetail` is the
one knowledge base query that skips the permission check. Each surface gates on
its own variables and renders a setup notice naming exactly what is missing, so
a portal with no CP token still serves the full knowledge base.

## Routes

| Route | Source |
| --- | --- |
| `/` | Support portal landing — ticket actions, announcements and knowledge base sections |
| `/knowledge-base` | `cpKnowledgeBaseTopicDetail` — full category browse |
| `/search?q=` | Knowledge base articles + CMS announcements, labelled by type |
| `/knowledge-base/category/[id]` | category header, sidebar and article list |
| `/knowledge-base/article/[id]` | article body, author, related articles |
| `/tickets` | portal home + `cpGetTickets` for the signed-in portal user |
| `/tickets/new` | `cpCreateTicket` |
| `/tickets/track` | `cpGetTickets` by ticket number |
| `/tickets/[id]` | `cpGetTicket` + `cpTicketGetNotes` / `cpTicketCreateNote` |
| `/announcements` | `cpPostList` (CMS) |
| `/announcements/[slug]` | `cpPost` (CMS) |
| `/account`, `/sign-in`, `/sign-up` | session surfaces |

## Structure

```text
app/                     routes only — each page composes modules
lib/cn.ts                class-name helper
modules/
  apollo/                RSC + client Apollo clients, env gating, result type
  auth/                  session (browser storage) + auth forms
  cms/                   CMS queries for announcements and portal copy
  knowledge-base/        queries, normalization, selectors, components
  layout/                header, footer, hero, search bar, portal identity
  tickets/               ticket queries/mutations and components
  ui/                    Button, Card, Badge, Field, Avatar, Icon, EmptyState…
```

## Data flow

GraphQL documents live under each module's `graphql/`. Server components read
through `modules/apollo/apolloClient.ts`; interactive surfaces (ticket form,
tracking, ticket thread) use the client provider in `ApolloWrapper.tsx`.

`modules/knowledge-base/normalize.ts` turns the API payload into the view model
the components consume — trimming titles, resolving the erxes icon name to a
local glyph (`modules/knowledge-base/icons.ts`) and deduplicating the category
authors that the API returns once per article.

Pages revalidate every 60 seconds (`export const revalidate` in
`app/layout.tsx`). Apollo is not `fetch`-based, so without it the App Router
would prerender the content once at build time.

## Design tokens

Colors, fonts and article typography are defined once in `app/globals.css`
(`@theme`). Components use the token utilities (`bg-hero`, `text-ink`,
`border-line`, `text-muted`, `bg-brand-soft`) rather than raw hex values.
