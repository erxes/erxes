import { z } from 'zod';

export const AGENTS_ARTIFACT_MAX_CONTENT = 500_000;

const artifactType = z.enum(['html', 'xlsx', 'docx', 'pdf']);
export const agentsArtifactInputSchema = z.object({
  type: artifactType.describe(
    'html for a report/dashboard/page, xlsx for CSV data, docx or pdf for a document',
  ),
  title: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .describe('The actual deliverable title, not a greeting or response label'),
  content: z
    .string()
    .trim()
    .min(1)
    .max(AGENTS_ARTIFACT_MAX_CONTENT)
    .describe(
      'Complete file contents, without Markdown fences: HTML for html, CSV for xlsx, Markdown for docx/pdf',
    ),
});

export const agentsArtifactResultSchema = z.object({
  kind: z.literal('artifact'),
  version: z.literal(1),
  artifact: agentsArtifactInputSchema.extend({
    filename: z.string().min(1).max(128),
  }),
});

/** A local deliverable, stored with its tool result by the durable chat runtime. */
export const createAgentsArtifact = (
  input: z.infer<typeof agentsArtifactInputSchema>,
) => {
  const artifact = agentsArtifactInputSchema.parse(input);
  const base =
    artifact.title
      .replace(/\.(html|xlsx|docx|pdf)$/i, '')
      .replace(/[\p{Cc}/\\:*?"<>|]/gu, '')
      .replace(/\s+/g, '-')
      .replace(/^[.-]+|[.-]+$/g, '') || 'document';
  return agentsArtifactResultSchema.parse({
    kind: 'artifact',
    version: 1,
    artifact: { ...artifact, filename: `${base}.${artifact.type}` },
  });
};

export const buildCreateArtifactTool = async () => {
  const { createTool } = await import('@mastra/core/tools');
  return createTool({
    id: 'createArtifact',
    description:
      'Create an actual downloadable deliverable requested by the user: a report, dashboard, page, spreadsheet, PDF or document. This returns a structured file card in chat. Never use it to render an ordinary reply, greeting, confirmation, question or explanation. Ordinary replies go directly in assistant text as HTML. This tool does not execute code or modify workspace records.',
    inputSchema: agentsArtifactInputSchema,
    outputSchema: agentsArtifactResultSchema,
    execute: async (input) => createAgentsArtifact(input),
  });
};
