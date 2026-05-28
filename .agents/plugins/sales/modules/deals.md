# sales > deals

Sales pipeline management — boards, pipelines, stages, deals, checklists, and labels.

## Eval files (verify these after changes)
Highest-priority files. If you touch this module, re-read these and re-run `../tests/deals.spec.ts`.

- `backend/plugins/sales_api/src/modules/sales/db/models/Deals.ts` — CRUD + activity log generation
- `backend/plugins/sales_api/src/modules/sales/graphql/resolvers/mutations/deals.ts` — write surface
- `backend/plugins/sales_api/src/modules/sales/graphql/resolvers/queries/deals.ts` — read surface
- `backend/plugins/sales_api/src/modules/sales/graphql/schemas/extensions.ts` — federation extensions
- `frontend/plugins/sales_ui/src/modules/deals/Main.tsx`
- `frontend/plugins/sales_ui/src/modules/deals/boards/hooks/useBoardDetails.ts`
- `frontend/plugins/sales_ui/src/modules/deals/cards/hooks/useDeals.tsx`
- `backend/plugins/sales_api/src/main.ts:71–129` — payment callback integration (if touching deal/payment plumbing)

## All files involved

### Backend — types
- `backend/plugins/sales_api/src/modules/sales/@types/deal.ts`
- `backend/plugins/sales_api/src/modules/sales/@types/pipeline.ts`
- `backend/plugins/sales_api/src/modules/sales/@types/stage.ts`
- `backend/plugins/sales_api/src/modules/sales/@types/board.ts`
- `backend/plugins/sales_api/src/modules/sales/@types/checklist.ts`
- `backend/plugins/sales_api/src/modules/sales/@types/label.ts`

### Backend — models & schema
- `backend/plugins/sales_api/src/modules/sales/db/models/Deals.ts`
- `backend/plugins/sales_api/src/modules/sales/db/models/Pipelines.ts`
- `backend/plugins/sales_api/src/modules/sales/db/models/Stages.ts`
- `backend/plugins/sales_api/src/modules/sales/db/models/Boards.ts`
- `backend/plugins/sales_api/src/modules/sales/db/models/Checklists.ts`
- `backend/plugins/sales_api/src/modules/sales/db/models/Labels.ts`
- `backend/plugins/sales_api/src/modules/sales/db/definitions/deals.ts`
- `backend/plugins/sales_api/src/modules/sales/db/definitions/pipelines.ts`
- `backend/plugins/sales_api/src/modules/sales/db/definitions/stages.ts`
- `backend/plugins/sales_api/src/modules/sales/db/definitions/boards.ts`

### Backend — GraphQL
- `backend/plugins/sales_api/src/modules/sales/graphql/schemas/deal.ts`
- `backend/plugins/sales_api/src/modules/sales/graphql/schemas/pipeline.ts`
- `backend/plugins/sales_api/src/modules/sales/graphql/schemas/stage.ts`
- `backend/plugins/sales_api/src/modules/sales/graphql/schemas/board.ts`
- `backend/plugins/sales_api/src/modules/sales/graphql/schemas/checklist.ts`
- `backend/plugins/sales_api/src/modules/sales/graphql/schemas/label.ts`
- `backend/plugins/sales_api/src/modules/sales/graphql/schemas/extensions.ts`
- `backend/plugins/sales_api/src/modules/sales/graphql/resolvers/queries/{deals,pipelines,stages,boards}.ts`
- `backend/plugins/sales_api/src/modules/sales/graphql/resolvers/mutations/{deals,pipelines,stages,boards,checklists}.ts`
- `backend/plugins/sales_api/src/modules/sales/graphql/resolvers/customResolvers/deal.ts`
- `backend/plugins/sales_api/src/modules/sales/graphql/resolvers/loaders/index.ts`

### Backend — tRPC, automation, segments, activity log
- `backend/plugins/sales_api/src/modules/sales/trpc/deal.ts`
- `backend/plugins/sales_api/src/modules/sales/meta/automations/constants.ts`
- `backend/plugins/sales_api/src/modules/sales/meta/automations/automationHandlers.ts`
- `backend/plugins/sales_api/src/modules/sales/meta/automations/action/createAction.ts`
- `backend/plugins/sales_api/src/modules/sales/meta/automations/trigger/checkCustomTrigger.ts`
- `backend/plugins/sales_api/src/modules/sales/meta/segments/segments.ts`
- `backend/plugins/sales_api/src/modules/sales/meta/segments/segmentConfigs.ts`
- `backend/plugins/sales_api/src/modules/sales/meta/activity-log/*` (8 files for deals/pipelines/stages/boards/checklists)
- `backend/plugins/sales_api/src/modules/sales/fieldUtils.ts`
- `backend/plugins/sales_api/src/modules/sales/utils.ts`
- `backend/plugins/sales_api/src/modules/sales/constants.ts`

### Frontend — entry & navigation
- `frontend/plugins/sales_ui/src/modules/deals/Main.tsx`
- `frontend/plugins/sales_ui/src/MainNavigation.tsx`
- `frontend/plugins/sales_ui/src/SalesSubNavigation.tsx`
- `frontend/plugins/sales_ui/src/SalesSettingsNavigation.tsx`
- `frontend/plugins/sales_ui/src/config.tsx` — exposes `deals` module + `relationWidget`

### Frontend — cards / boards / pipelines / stages
- `frontend/plugins/sales_ui/src/modules/deals/cards/hooks/{useDeals,useChecklists,useDealCustomFieldEdit}.tsx`
- `frontend/plugins/sales_ui/src/modules/deals/cards/components/{AddCardForm,WorkflowFields}.tsx`
- `frontend/plugins/sales_ui/src/modules/deals/boards/hooks/useBoardDetails.ts`
- `frontend/plugins/sales_ui/src/modules/deals/boards/components/{BoardHeader,BoardCreateForm,...}.tsx`
- `frontend/plugins/sales_ui/src/modules/deals/pipelines/hooks/usePipelineDetails.ts`
- `frontend/plugins/sales_ui/src/modules/deals/pipelines/components/{PipelineForm,PipelineConfig,Attribution}.tsx`
- `frontend/plugins/sales_ui/src/modules/deals/stage/hooks/usePipelineStages.ts`

### Frontend — state, context, components
- `frontend/plugins/sales_ui/src/modules/deals/context/{DealContext,PipelinesInlineContext,StagesInlineContext,BoardsInlineContext,DragContext}.tsx`
- `frontend/plugins/sales_ui/src/modules/deals/states/{dealsBoardState,dealContainerState,dealsViewState,dealCreateSheetState,...}.ts(x)`
- `frontend/plugins/sales_ui/src/modules/deals/components/{AddDealSheet,ChooseDealSheet,SalesLeftSidebar,DealsTotalCount,...}.tsx`
- `frontend/plugins/sales_ui/src/modules/deals/components/breadcrumb/SalesBreadCrumb.tsx`
- `frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/*.tsx`
- `frontend/plugins/sales_ui/src/modules/deals/actionBar/*` — filter + view toolbar

### Frontend — GraphQL & types
- `frontend/plugins/sales_ui/src/modules/deals/graphql/queries/*`
- `frontend/plugins/sales_ui/src/modules/deals/graphql/mutations/*`
- `frontend/plugins/sales_ui/src/modules/deals/graphql/subscriptions/*`
- `frontend/plugins/sales_ui/src/modules/deals/types/{deals,pipelines,stages,boards,checklists,attachments,products}.ts`
- `frontend/plugins/sales_ui/src/modules/deals/constants/*`
- `frontend/plugins/sales_ui/src/modules/deals/schemas/{boardFormSchema,pipelineFormSchema}.ts`
- `frontend/plugins/sales_ui/src/modules/deals/utils/{arrayMove,common}.ts`

### Shared
- `backend/erxes-api-shared/src/utils/*` — service discovery, redis, common types — consumed throughout
- `frontend/libs/erxes-ui/*` — UI primitives (Sheet, Dialog, Form, Select…)
- `frontend/libs/ui-modules/*` — cross-plugin UI modules

## Connected to / related to

| Other surface | How | Where |
|---|---|---|
| **core / User** | `assignedUserIds[]` resolved via DataLoader | `loaders/index.ts` |
| **core / Customer** | `customerId` reference, two-way segment association | resolvers + `segmentConfigs.ts` |
| **core / Company** | `companyIds[]` | `loaders/index.ts` |
| **core / Branch+Department** | `branchIds[]`, `departmentIds[]` | `customResolvers/deal.ts` |
| **core / Tag** | `labelIds[]` (sales label vs. tag — both used) | resolvers |
| **core / Product** | `productsData[].productId` for deal line items | resolvers + `fieldUtils.ts` |
| **frontline / Conversation** | `sourceConversationIds[]` two-way link | `db/definitions/deals.ts`, segment config |
| **frontline / Ticket** | segment association | `segmentConfigs.ts` |
| **operation / Task** | segment association | `segmentConfigs.ts` |
| **payment** | callback updates `deal.paymentsData.bank` when invoice status changes | `backend/plugins/sales_api/src/main.ts:71–129` |
| **cars** | segment association | `segmentConfigs.ts` |
| **Automation** | trigger `sales:deal` (created, probability), action `create` (deal, checklist) | `meta/automations/*` |
| **Activity log** | every CRUD generates an entry via `generateDeal*ActivityLog` | `meta/activity-log/*` |
| **Federation** | `Deal`, `SalesBoard`, `SalesPipeline`, `SalesStage`, `SalesPipelineLabel` exposed via `@key(fields: "_id")` | `graphql/schemas/extensions.ts` |

## Playwright test
See `../tests/deals.spec.ts`.
