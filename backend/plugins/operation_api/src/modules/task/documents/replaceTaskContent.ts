import {
  checkPermissionGroup,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';
import { ExpectedError, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext, IModels } from '~/connectionResolvers';
import { getTaskExportData } from '~/meta/import-export/export/getTaskExportData';
import { isRecord } from '~/modules/automations/utils';

/** Replace task attributes while preserving the template's block structure. */
export const fillTaskDocument = (
  blocks: unknown[],
  fields: Record<string, string>,
): string => {
  /** Replace inline attributes and recursively visit nested block content. */
  function replaceNode(node: unknown): unknown {
    if (Array.isArray(node)) {
      return node.map(replaceNode);
    }

    if (!isRecord(node)) {
      return node;
    }

    if (node.type === 'attribute') {
      const { props, ...rest } = node;
      const path =
        isRecord(props) && typeof props.value === 'string' ? props.value : '';

      return { ...rest, type: 'text', text: fields[path] || '-', styles: {} };
    }

    return Object.fromEntries(
      Object.entries(node).map(([key, value]) => [
        key,
        key === 'children' && Array.isArray(value)
          ? value.map(replaceBlock)
          : replaceNode(value),
      ]),
    );
  }

  /** Convert legacy standalone attributes into printable paragraph blocks. */
  function replaceBlock(block: unknown): unknown {
    if (isRecord(block) && block.type === 'attribute') {
      return {
        id: block.id,
        type: 'paragraph',
        props: {},
        content: [replaceNode(block)],
        children: Array.isArray(block.children)
          ? block.children.map(replaceBlock)
          : [],
      };
    }

    return replaceNode(block);
  }

  return JSON.stringify(blocks.map(replaceBlock));
};

/** Render every requested task only after checking the acting user's access. */
export const replaceTaskContent = async (
  { content, replacerIds }: { content: string; replacerIds: string[] },
  context: Pick<IImportExportContext<IModels>, 'subdomain' | 'models'> & {
    userId?: string;
    processId?: string;
  },
): Promise<string[]> => {
  if (!context.userId)
    throw new ExpectedError('Login required', 'UNAUTHORIZED');
  const user: IContext['user'] | null = await sendTRPCMessage({
    subdomain: context.subdomain,
    pluginName: 'core',
    module: 'users',
    action: 'findOne',
    input: { query: { _id: context.userId, isActive: { $ne: false } } },
    defaultValue: null,
  });
  await checkPermissionGroup(context.subdomain, user ?? undefined)('taskRead');

  if (!replacerIds.length) {
    return [];
  }

  let blocks: unknown;
  try {
    blocks = JSON.parse(content);
  } catch {
    throw new Error('Task document content must be valid block JSON.');
  }

  if (!Array.isArray(blocks)) {
    throw new TypeError('Task document content must be a block array.');
  }

  const rows = await getTaskExportData(
    {
      moduleName: 'task',
      collectionName: 'tasks',
      ids: replacerIds,
      limit: replacerIds.length,
    },
    { ...context, processId: context.processId ?? '' },
  );
  const rowsById = new Map(rows.map((row) => [row._id, row]));
  const contents: string[] = [];

  for (const id of replacerIds) {
    const row = rowsById.get(id);
    if (!row)
      throw new ExpectedError('A selected task no longer exists.', 'NOT_FOUND');
    contents.push(fillTaskDocument(blocks, row));
  }

  return contents;
};
