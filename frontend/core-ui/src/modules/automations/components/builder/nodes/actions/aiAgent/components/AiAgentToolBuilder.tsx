import { useTranslation } from 'react-i18next';
import {
  AiAgentRow,
  AiAgentRowList,
} from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentRowList';
import { AiAgentToolMemorizeFields } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentToolMemorizeFields';
import { useAiAgentToolBuilder } from '@/automations/components/builder/nodes/actions/aiAgent/hooks/useAiAgentToolBuilder';
import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { Badge, Form, Input, Select, Textarea } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';

export const AiAgentToolBuilder = () => {
  const { t } = useTranslation('automations');
  const { list, isEmpty, rows, handleAdd, remove } = useAiAgentToolBuilder();

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        {t('ai-agent-tools-description')}
      </p>
      <AiAgentRowList
        openId={list.openId}
        onOpenChange={list.setOpenId}
        search={list.search}
        onSearchChange={list.setSearch}
        showSearch={list.showSearch}
        hasNoMatch={list.hasNoMatch}
        isEmpty={isEmpty}
        errorMessage={list.listErrorMessage}
        addLabel={t('ai-agent-add-tool')}
        onAdd={handleAdd}
      >
        {rows.map((row) => (
          <AiAgentRow
            key={row.key}
            value={row.id}
            title={row.title}
            badges={
              <>
                <Badge variant="secondary" className="shrink-0">
                  {t(row.kindLabelKey)}
                </Badge>
                {row.missingDescription && (
                  <Badge variant="warning" className="shrink-0">
                    {t('ai-agent-tool-no-description')}
                  </Badge>
                )}
              </>
            }
            preview={row.preview}
            hasError={row.hasError}
            onRemove={() => remove(row.index)}
          >
            <AiAgentToolFields index={row.index} />
            {row.toolId && (
              <AiAgentToolMemorizeFields
                index={row.index}
                toolId={row.toolId}
              />
            )}
          </AiAgentRow>
        ))}
      </AiAgentRowList>
    </div>
  );
};

const AiAgentToolFields = ({ index }: { index: number }) => {
  const { t } = useTranslation('automations');
  const { control } = useFormContext<TAiAgentConfigForm>();

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        <Form.Field
          control={control}
          name={`tools.${index}.name`}
          render={({ field }) => (
            <Form.Item className="col-span-2">
              <Form.Label>{t('ai-agent-tool-name-placeholder')}</Form.Label>
              <Input
                {...field}
                placeholder={t('ai-agent-tool-name-placeholder')}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name={`tools.${index}.kind`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('ai-agent-tool-kind')}</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="helper">
                    {t('ai-agent-tool-kind-helper')}
                  </Select.Item>
                  <Select.Item value="handoff">
                    {t('ai-agent-tool-kind-handoff')}
                  </Select.Item>
                </Select.Content>
              </Select>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
      <Form.Field
        control={control}
        name={`tools.${index}.description`}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('ai-agent-tool-description')}</Form.Label>
            <Textarea
              {...field}
              placeholder={t('ai-agent-tool-description-placeholder')}
            />
            <Form.Description>
              {t('ai-agent-tool-description-hint')}
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />
    </>
  );
};
