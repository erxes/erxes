import { IImportExportContext } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { getTaskExportData } from '~/meta/import-export/export/getTaskExportData';
import { isRecord } from '~/modules/automations/utils';

export const fillTaskDocument = (
  blocks: unknown[],
  fields: Record<string, string>,
): string => {
  const replaceNode = (node: unknown): unknown => {
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
  };

  const replaceBlock = (block: unknown): unknown => {
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
  };

  return JSON.stringify(blocks.map(replaceBlock));
};

export const replaceTaskContent = async (
  { content, replacerIds }: { content: string; replacerIds: string[] },
  context: Pick<IImportExportContext<IModels>, 'subdomain' | 'models'> & {
    processId?: string;
  },
): Promise<string[]> => {
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
    throw new Error('Task document content must be a block array.');
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
    if (row) {
      contents.push(fillTaskDocument(blocks, row));
    }
  }

  return contents;
};
