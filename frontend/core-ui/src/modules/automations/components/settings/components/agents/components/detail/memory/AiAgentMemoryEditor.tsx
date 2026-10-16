import { AiAgentContextFileEditor } from '@/automations/components/settings/components/agents/components/detail/memory/AiAgentContextFileEditor';
import { AiAgentContextFilesForm } from '@/automations/components/settings/components/agents/components/form/AiAgentContextFilesForm';
import { AiAgentKnowledgeSourceSelector } from '@/automations/components/settings/components/agents/components/form/AiAgentKnowledgeSourceSelector';
import { TAiAgentMemoryItem } from '@/automations/components/settings/components/agents/hooks/useAiAgentMemoryItems';
import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { getNextContextFilesAfterEdit } from '@/automations/components/settings/components/agents/utils/contextFiles';
import { Form, Textarea } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';

const AiAgentInstructionsEditor = () => {
  const { control } = useFormContext<TAiAgentForm>();

  return (
    <Form.Field
      control={control}
      name="context.systemPrompt"
      render={({ field }) => (
        <Form.Item className="flex h-full min-h-0 flex-col">
          <Form.Control>
            <Textarea
              className="min-h-60 flex-1 resize-none font-mono text-sm"
              placeholder="You are the sales assistant for this store. Answer in the customer's language, keep replies short, and never invent facts."
              {...field}
            />
          </Form.Control>
          <Form.Description>
            Always loaded before files and sources. {field.value?.length || 0}
            /4000 chars.
          </Form.Description>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

const AiAgentFileEditor = ({
  file,
}: {
  file: TAiAgentForm['context']['files'][number];
}) => {
  const { getValues, setValue } = useFormContext<TAiAgentForm>();

  return (
    <AiAgentContextFileEditor
      file={file}
      onSave={(nextFile) =>
        setValue(
          'context.files',
          getNextContextFilesAfterEdit({
            files: getValues('context.files'),
            fileId: nextFile.id,
            uploadedFile: nextFile,
          }).map((current) => ({
            ...current,
            versions: current.versions || [],
          })),
          { shouldDirty: true },
        )
      }
    />
  );
};

export const AiAgentMemoryEditor = ({ item }: { item: TAiAgentMemoryItem }) => {
  const Icon = item.icon;

  return (
    <section className="flex min-h-0 min-w-0 flex-col gap-3">
      <header className="flex h-9 shrink-0 items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        <h3 className="min-w-0 truncate text-sm font-medium">
          {item.kind === 'files' ? 'Context files' : item.label}
        </h3>
      </header>
      <div className="min-h-0 flex-1">
        {item.kind === 'instructions' && <AiAgentInstructionsEditor />}
        {item.kind === 'files' && <AiAgentContextFilesForm />}
        {item.kind === 'file' && <AiAgentFileEditor file={item.file} />}
        {item.kind === 'source' && (
          <AiAgentKnowledgeSourceSelector source={item.source} />
        )}
      </div>
    </section>
  );
};
