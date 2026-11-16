import { useAiAgentRowList } from '@/automations/components/builder/nodes/actions/aiAgent/hooks/useAiAgentRowList';
import {
  TAiAgentConfigForm,
  TAiAgentToolFormValue,
} from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { useCallback } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { generateAutomationElementId } from 'ui-modules';

const toolLabelOf = (tool?: TAiAgentToolFormValue) => tool?.name || '';

const newTool = (id: string, number: number): TAiAgentToolFormValue => ({
  id,
  name: `tool_${number}`,
  description: '',
  kind: 'helper',
  memorizeFields: [],
});

/** The agent's tools as rows: only those the search shows, ready to draw. */
export const useAiAgentToolBuilder = () => {
  const { control } = useFormContext<TAiAgentConfigForm>();
  const { fields, append, remove } = useFieldArray({ control, name: 'tools' });
  const tools: TAiAgentToolFormValue[] =
    useWatch({ control, name: 'tools' }) || [];
  const list = useAiAgentRowList({
    name: 'tools',
    fields,
    values: tools,
    getLabel: toolLabelOf,
  });

  const rows = fields.flatMap((field, index) => {
    const { id } = list.items[index];
    const tool = tools[index];

    return list.isVisible(id)
      ? [
          {
            key: field.id,
            index,
            id,
            title: toolLabelOf(tool),
            preview: tool?.description,
            kindLabelKey:
              tool?.kind === 'handoff'
                ? 'ai-agent-tool-kind-handoff'
                : 'ai-agent-tool-kind-helper',
            missingDescription: !tool?.description,
            toolId: tool?.id,
            hasError: list.hasError(id),
          },
        ]
      : [];
  });

  const handleAdd = useCallback(() => {
    const id = generateAutomationElementId();

    append(newTool(id, fields.length + 1));
    list.openRow(id);
  }, [append, fields.length, list]);

  return { list, isEmpty: !fields.length, rows, handleAdd, remove };
};
