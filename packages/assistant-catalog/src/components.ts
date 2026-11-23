import { CommonSchemas } from '@a2ui/web_core/v1_0';
import { z } from 'zod';

const STAT_TONES = ['neutral', 'good', 'bad'] as const;

const BADGE_TONES = ['neutral', 'info', 'good', 'warning', 'bad'] as const;

const CHART_KINDS = ['bar', 'line', 'area', 'pie'] as const;

export const StatApi = {
  name: 'Stat',
  schema: z
    .object({
      label: CommonSchemas.DynamicString.describe('What the number measures, such as "Revenue".'),
      value: CommonSchemas.DynamicString.describe(
        'The number as the member reads it, formatted with its unit, such as "₮48.2M".',
      ),
      change: CommonSchemas.DynamicString.optional().describe(
        'The change against the period before, such as "+12%".',
      ),
      tone: z
        .enum(STAT_TONES)
        .optional()
        .describe('Whether the change is good or bad news; colours the change.'),
    })
    .describe('One headline number with its label. Put two to four in a Row.'),
};

export const BadgeApi = {
  name: 'Badge',
  schema: z
    .object({
      text: CommonSchemas.DynamicString.describe('One or two words, such as a status.'),
      tone: z.enum(BADGE_TONES).optional().describe('The colour of the badge.'),
    })
    .describe('A small coloured label for a status or category.'),
};

export const TableApi = {
  name: 'Table',
  schema: z
    .object({
      columns: z
        .array(
          z.object({
            label: z.string().describe('The column heading.'),
            align: z
              .enum(['start', 'end'])
              .optional()
              .describe('end for numbers and money; start otherwise.'),
          }),
        )
        .min(1)
        .max(8)
        .describe('The columns, left to right.'),
      rows: z
        .array(z.array(z.string()))
        .max(50)
        .describe(
          'One list of cell texts per row, in column order. A cell is plain text, or a record reference such as [[ref:k2Xp9aQ0vB7LmN4rT]] to show the record as a link.',
        ),
    })
    .describe('Records or figures in columns. Use it instead of a Markdown table.'),
};

export const ChartApi = {
  name: 'Chart',
  schema: z
    .object({
      kind: z
        .enum(CHART_KINDS)
        .describe(
          'bar to compare categories, line or area for a trend over time, pie for shares of one total.',
        ),
      labels: z
        .array(z.string())
        .min(1)
        .max(60)
        .describe('The category of each point in order, such as months or stage names.'),
      series: z
        .array(
          z.object({
            name: z.string().describe('What the series measures; shown in the legend.'),
            values: z.array(z.number()).describe('One number per label, in the same order.'),
          }),
        )
        .min(1)
        .max(6)
        .describe('The series to draw. A pie takes exactly one.'),
      title: z.string().optional().describe('A heading above the chart.'),
    })
    .describe('A chart of numbers a tool returned. Never chart numbers you made up.'),
};

export const MemberPickerApi = {
  name: 'MemberPicker',
  schema: z
    .object({
      label: CommonSchemas.DynamicString.optional().describe('The label above the picker.'),
      value: CommonSchemas.DynamicStringList.describe(
        'Bind it to a string list in the data model. Each picked member is written as "Name (member id <id>)".',
      ),
      multiple: z.boolean().optional().describe('true to let the member pick several.'),
      checks: CommonSchemas.Checkable.shape.checks,
    })
    .describe(
      'Lets the member pick workspace team members by name. Use it whenever an answer is a team member.',
    ),
};

export const RECORD_KINDS = ['customer', 'company', 'product', 'tag'] as const;

const CALLOUT_TONES = ['info', 'good', 'warning', 'bad'] as const;

const FLOW_KINDS = ['trigger', 'if', 'action', 'wait'] as const;

export const RecordPickerApi = {
  name: 'RecordPicker',
  schema: z
    .object({
      label: CommonSchemas.DynamicString.optional().describe('The label beside the picker.'),
      kind: z.enum(RECORD_KINDS).describe('The kind of record to pick.'),
      tagsOf: z
        .enum(['customer', 'company'])
        .optional()
        .describe('For kind "tag": whose tags to list. customer when left out.'),
      value: CommonSchemas.DynamicStringList.describe(
        'Bind it to a string list in the data model. Each picked record is written as "Name (<kind> id <id>)", such as "VIP (tag id k2Xp9aQ0vB7LmN4rT)". Initialise it with the record you recommend, in that form.',
      ),
      multiple: z.boolean().optional().describe('true to let the member pick several.'),
      checks: CommonSchemas.Checkable.shape.checks,
    })
    .describe(
      'Lets the member search and pick customers, companies, products or tags by name. Use it whenever an answer is one of those records; use MemberPicker for team members.',
    ),
};

export const CalloutApi = {
  name: 'Callout',
  schema: z
    .object({
      title: CommonSchemas.DynamicString.describe(
        'One short line, such as "No “Big spender” tag yet".',
      ),
      text: CommonSchemas.DynamicString.optional().describe('One more sentence when needed.'),
      tone: z
        .enum(CALLOUT_TONES)
        .optional()
        .describe('warning for something missing or blocking, bad for a failure; info otherwise.'),
      action: CommonSchemas.Child.describe(
        'REF:#/$defs/Child|The id of one Button that fixes it, such as "Create the tag".',
      ).optional(),
    })
    .describe(
      'A short notice with an optional fix button: something missing, blocked or worth knowing before the member goes on.',
    ),
};

const FlowStep = z.object({
  kind: z.enum(FLOW_KINDS).describe('trigger starts it, if checks, action does, wait pauses.'),
  text: z
    .string()
    .describe(
      'What the step does in a few words. A record reference such as [[ref:k2Xp9aQ0vB7LmN4rT]] shows as a link.',
    ),
});

export const FlowApi = {
  name: 'Flow',
  schema: z
    .object({
      title: z.string().optional().describe('A heading above the flow.'),
      steps: z.array(FlowStep).min(1).max(12).describe('The steps in order, top to bottom.'),
      branches: z
        .array(
          z.object({
            label: z.string().describe('When this branch runs, such as "Yes" or "Not VIP".'),
            steps: z.array(FlowStep).min(1).max(8),
          }),
        )
        .max(4)
        .optional()
        .describe('Paths that split after the last step, side by side.'),
    })
    .describe(
      'A process drawn as steps: an automation, a workflow or a plan, before or after you create it. Draw only what you will create or what a tool returned.',
    ),
};
