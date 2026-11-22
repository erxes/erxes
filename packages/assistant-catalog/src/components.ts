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
