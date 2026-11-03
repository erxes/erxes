import { IAgentPluginMeta } from 'erxes-api-shared/core-modules';

const PIPELINE_ANALYSIS = `# Deal pipeline analysis

Sales data is a hierarchy: board → pipeline → stage → deal. Each stage has a \`probability\`: a percentage such as \`30%\` for open stages, or \`Won\` / \`Lost\`.

## Steps

1. **Find the pipeline.** List boards with \`salesBoards\` and their pipelines with \`salesPipelines(boardId)\` (\`list { _id name }\`). If a name matches more than one pipeline, say which one you used.
2. **Break it down by stage.** Call \`salesStages(pipelineId)\` selecting \`_id name order probability itemsTotalCount amount\`. \`itemsTotalCount\` is the number of deals in the stage and \`amount\` is a map of currency to the stage total. Both apply the filters you pass as operation variables (\`assignedUserIds\`, \`labelIds\`, \`closeDateStartDate\`/\`closeDateEndDate\`, \`createdStartDate\`/\`createdEndDate\`). Present stages in \`order\`.
3. **Get the totals.** \`dealsTotalCount(pipelineId, …)\` counts deals with the same filters. \`dealsTotalAmounts(pipelineId, …)\` returns totals per currency for \`Won\`, \`Lost\`, \`In progress\` and a probability-weighted \`forecasted 10-90%\` row.
4. **Look at individual deals only when needed.** Use \`deals(pipelineId, stageId, limit)\` and select \`list { _id name amount closeDate stageChangedDate assignedUsers { _id details { fullName } } }\`. Deals whose stage has not changed for a while can be found with \`stageChangedEndDate\`.

## Rules

- Never add amounts in different currencies together; report each currency separately.
- Win rate is won deals ÷ (won + lost deals) in the same period, using the counts of the \`Won\` and \`Lost\` stages. Say which period it covers.
- Stage conversion compares consecutive open stages by deal count; label it as a snapshot of where deals are now, not a history of how they moved.
- Use counts and totals rather than downloading every deal.`;

/**
 * What sales contributes to the core AI assistant. `cp*` operations serve
 * client portal users (`forClientPortal`), so the agent, which acts as a
 * team member, does not discover them; they stay callable and permissioned.
 */
export const agent: IAgentPluginMeta = {
  skills: [
    {
      name: 'pipeline-analysis',
      description:
        'Analyse deals by board, pipeline and stage: deal counts, amounts per currency, won/lost, forecast, win rate and stalled deals. Use for sales pipeline, funnel or stage questions and pipeline reports.',
      instructions: PIPELINE_ANALYSIS,
      operations: [
        'salesBoards',
        'salesPipelines',
        'salesStages',
        'dealsTotalCount',
        'dealsTotalAmounts',
        'deals',
      ],
    },
  ],
  hiddenOperations: {
    queries: [
      'cpDeals',
      'cpDealDetail',
      'cpSalesBoards',
      'cpSalesBoardDetail',
      'cpSalesCheckFreeTimes',
      'cpSalesPipelines',
      'cpSalesPipelineLabels',
      'cpSalesStages',
    ],
    mutations: [
      'cpDealsAdd',
      'cpDealsEdit',
      'cpDealsChange',
      'cpDealsCreateProductsData',
      'cpDealsEditProductData',
      'cpSalesPipelineLabelsAdd',
    ],
  },
};
