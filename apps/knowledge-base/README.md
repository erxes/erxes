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

| Variable                    | Needed for | Notes                                                                       |
| --------------------------- | ---------- | --------------------------------------------------------------------------- |
| `NEXT_PUBLIC_ERXES_API_URL` | everything | Gateway URL, e.g. `https://officenext.erxes.io/gateway` (no trailing slash) |

That is the whole file. Everything else — the portal's name, its app token, the
knowledge base topic it renders, where a ticket lands, and how it is painted —
comes from a **help center**, looked up by the address each request arrives on.

Create one under **Frontline → Help Center** and set its **Website** to the
address this portal is served from; for local work that is
`http://localhost:3900`. Until a help center claims the address, every page
says so and names the domain it looked for.

The website field is a client portal picker: choosing one also stores that
portal's token as the config's `erxesAppToken`, which is what the `cp*` CMS and
ticket queries authenticate with.

## Docker

The image builds from the **repository root**, because the portal compiles a
few form controls straight out of the `erxes-ui` source tree:

```bash
docker build -f apps/knowledge-base/Dockerfile \
  --build-arg NEXT_PUBLIC_ERXES_API_URL=https://officenext.erxes.io/gateway \
  -t erxes/knowledge-base .

docker run -p 3900:3900 erxes/knowledge-base
```

The gateway address is a **build argument**, not a runtime one: Next inlines
every `NEXT_PUBLIC_*` value into the client bundle during `next build`, so an
image is tied to the gateway it was built against. One image still serves any
number of portals on that gateway — the rest of the configuration is looked up
per request from the help center matching the domain.

Serving the portal behind a proxy, forward the original host, since that is
what the help center is matched on:

```nginx
proxy_set_header X-Forwarded-Host  $host;
proxy_set_header X-Forwarded-Proto $scheme;
```

`PORT` (default `3900`) and `HOSTNAME` (default `0.0.0.0`) are read at
container start. The build uses Next's `standalone` output, so the runtime
stage carries only the traced server bundle rather than a full `node_modules`.

A local `.env.local` is deleted inside the build stage before `next build`
runs. Without that, the developer file that the build context carries in would
override the build argument and bake that machine's app token into the image.

## Routes

| Route                              | Source                                                                             |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| `/`                                | Support portal landing — ticket actions, announcements and knowledge base sections |
| `/knowledge-base`                  | `cpKnowledgeBaseTopicDetail` — full category browse                                |
| `/search?q=`                       | Knowledge base articles + CMS announcements, labelled by type                      |
| `/knowledge-base/category/[id]`    | category header, sidebar and article list                                          |
| `/knowledge-base/article/[id]`     | article body, author, related articles                                             |
| `/tickets`                         | portal home + `cpGetTickets` for the signed-in portal user                         |
| `/tickets/new`                     | `cpCreateTicket`                                                                   |
| `/tickets/track`                   | `cpGetTickets` by ticket number                                                    |
| `/tickets/[id]`                    | `cpGetTicket` + `cpTicketGetNotes` / `cpTicketCreateNote`                          |
| `/announcements`                   | `cpPostList` (CMS)                                                                 |
| `/announcements/[slug]`            | `cpPost` (CMS)                                                                     |
| `/account`, `/sign-in`, `/sign-up` | session surfaces                                                                   |

## Structure

```text
app/                     routes only — each page composes modules
lib/cn.ts                class-name helper
modules/
  apollo/                RSC + client Apollo clients, gateway URL, result type
  config/                help center config, resolved from the request domain
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
