# frontline > knowledgebase

Self-service documentation, help center articles, categories, and topics.

## Eval files (verify these after changes)
Highest-priority files. If you touch this module, re-read these:

- `backend/plugins/frontline_api/src/modules/knowledgebase/db/models/Article.ts` — Article CRUD
- `backend/plugins/frontline_api/src/modules/knowledgebase/db/models/Category.ts` — Category CRUD
- `backend/plugins/frontline_api/src/modules/knowledgebase/db/models/Topic.ts` — Topic CRUD
- `backend/plugins/frontline_api/src/modules/knowledgebase/graphql/schemas/knowledgeBaseTypeDefs.ts` — Graphql surface

## All files involved

### Backend — types
- `backend/plugins/frontline_api/src/modules/knowledgebase/@types/article.ts`
- `backend/plugins/frontline_api/src/modules/knowledgebase/@types/category.ts`
- `backend/plugins/frontline_api/src/modules/knowledgebase/@types/topic.ts`

### Backend — models & schema
- `backend/plugins/frontline_api/src/modules/knowledgebase/db/models/Article.ts`
- `backend/plugins/frontline_api/src/modules/knowledgebase/db/models/Category.ts`
- `backend/plugins/frontline_api/src/modules/knowledgebase/db/models/Topic.ts`
- `backend/plugins/frontline_api/src/modules/knowledgebase/db/definitions/article.ts`
- `backend/plugins/frontline_api/src/modules/knowledgebase/db/definitions/category.ts`
- `backend/plugins/frontline_api/src/modules/knowledgebase/db/definitions/topic.ts`

### Backend — GraphQL
- `backend/plugins/frontline_api/src/modules/knowledgebase/graphql/schemas/knowledgeBaseTypeDefs.ts`
- `backend/plugins/frontline_api/src/modules/knowledgebase/graphql/resolvers/queries/knowledgeBase.ts`
- `backend/plugins/frontline_api/src/modules/knowledgebase/graphql/resolvers/mutations/knowledgeBase.ts`

### Frontend — entry & navigation
- `frontend/plugins/frontline_ui/src/pages/knowledgebase/IndexPage.tsx`
- `frontend/plugins/frontline_ui/src/modules/knowledgebase/*`

## Connected to / related to

| Other surface | How | Where |
|---|---|---|
| **core / User** | `createdBy` / `modifiedBy` tracking | definitions + resolvers |
