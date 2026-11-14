import {
  ASSISTANT_ARTIFACT_FORMATS,
  ASSISTANT_DOCUMENT_TYPES,
  ASSISTANT_IMAGE_TYPES,
  ASSISTANT_TEXT_TYPES,
} from '@erxes/core-db/enums';
import { z } from 'zod';
import { Id } from './common';
import { AssistantMentions, AssistantPage, AssistantPagePath } from './records';

export const ASSISTANT_FILES_MAX = 5;

export const ASSISTANT_SELECTIONS_MAX = 3;

export const ASSISTANT_IMAGE_MAX_MB = 4;

export const ASSISTANT_FILE_MAX_MB = 10;

export const ASSISTANT_SELECTION_TEXT_MAX = 8000;

export const ASSISTANT_ARTIFACT_MAX_CHARS = 200_000;

export const AssistantImageType = z.enum(ASSISTANT_IMAGE_TYPES);

export type AssistantImageType = z.infer<typeof AssistantImageType>;

export const AssistantDocumentType = z.enum(ASSISTANT_DOCUMENT_TYPES);

export type AssistantDocumentType = z.infer<typeof AssistantDocumentType>;

export const AssistantTextType = z.enum(ASSISTANT_TEXT_TYPES);

export const AssistantFileType = z.union([
  AssistantImageType,
  AssistantDocumentType,
  AssistantTextType,
]);

export type AssistantFileType = z.infer<typeof AssistantFileType>;

export const ASSISTANT_FILE_TYPES: readonly AssistantFileType[] = [
  ...ASSISTANT_IMAGE_TYPES,
  ...ASSISTANT_DOCUMENT_TYPES,
  ...ASSISTANT_TEXT_TYPES,
];

export const assistantFileLimitMb = (contentType: string) =>
  AssistantImageType.safeParse(contentType).success
    ? ASSISTANT_IMAGE_MAX_MB
    : ASSISTANT_FILE_MAX_MB;

export const AssistantAttachment = z.object({
  id: Id,
  name: z.string().trim().min(1).max(255),
  contentType: z.string().max(255),
  size: z.int().min(0),
});

export type AssistantAttachment = z.infer<typeof AssistantAttachment>;

export const AssistantFiles = z.object({
  files: z
    .array(AssistantAttachment)
    .min(1)
    .max(ASSISTANT_FILES_MAX)
    .refine((files) => new Set(files.map(({ id }) => id)).size === files.length, 'each file once'),
});

export type AssistantFiles = z.infer<typeof AssistantFiles>;

export const AssistantSelection = z.object({
  id: z.string().regex(/^[\w-]{1,64}$/),
  title: z.string().trim().min(1).max(80),
  path: AssistantPagePath,
  text: z.string().max(ASSISTANT_SELECTION_TEXT_MAX),
  width: z.int().min(1).max(100_000),
  height: z.int().min(1).max(100_000),
  snapshot: Id,
});

export type AssistantSelection = z.infer<typeof AssistantSelection>;

export const AssistantSelections = z.object({
  selections: z
    .array(AssistantSelection)
    .min(1)
    .max(ASSISTANT_SELECTIONS_MAX)
    .refine(
      (items) =>
        new Set(items.map(({ id }) => id)).size === items.length &&
        new Set(items.map(({ snapshot }) => snapshot)).size === items.length,
      'each selection and snapshot once',
    ),
});

export type AssistantSelections = z.infer<typeof AssistantSelections>;

export const ASSISTANT_DATA_PARTS = {
  mentions: AssistantMentions,
  page: AssistantPage,
  files: AssistantFiles,
  selections: AssistantSelections,
};

export const AssistantArtifactFormat = z.enum(ASSISTANT_ARTIFACT_FORMATS);

export type AssistantArtifactFormat = z.infer<typeof AssistantArtifactFormat>;

export const AssistantArtifact = z.object({
  format: AssistantArtifactFormat,
  title: z.string().trim().min(1).max(100),
  filename: z.string().min(1).max(128),
  content: z.string().min(1).max(ASSISTANT_ARTIFACT_MAX_CHARS),
});

export type AssistantArtifact = z.infer<typeof AssistantArtifact>;
