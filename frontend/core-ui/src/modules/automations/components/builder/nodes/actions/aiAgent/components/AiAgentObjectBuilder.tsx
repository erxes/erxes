import { AiAgentObjectFieldBuilder } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentObjectFieldBuilder';
import { TAiAgentFieldsGroupName } from '@/automations/components/builder/nodes/actions/aiAgent/hooks/useAiAgentObjectField';
import {
  AiAgentRow,
  AiAgentRowList,
} from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentRowList';
import { useAiAgentObjectBuilder } from '@/automations/components/builder/nodes/actions/aiAgent/hooks/useAiAgentObjectBuilder';
import { Badge } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AiAgentObjectBuilder = ({
  name = 'objectFields',
}: {
  name?: TAiAgentFieldsGroupName;
}) => {
  const { t } = useTranslation('automations');
  const { list, isEmpty, rows, handleAdd, remove } =
    useAiAgentObjectBuilder(name);

  return (
    <AiAgentRowList
      openId={list.openId}
      onOpenChange={list.setOpenId}
      search={list.search}
      onSearchChange={list.setSearch}
      showSearch={list.showSearch}
      hasNoMatch={list.hasNoMatch}
      isEmpty={isEmpty}
      errorMessage={list.listErrorMessage}
      addLabel={t('ai-agent-add-field')}
      onAdd={handleAdd}
    >
      {rows.map((row) => (
        <AiAgentRow
          key={row.key}
          value={row.id}
          title={row.title}
          badges={
            <Badge variant="secondary" className="shrink-0">
              {row.typeLabel}
            </Badge>
          }
          preview={row.preview}
          hasError={row.hasError}
          onRemove={() => remove(row.index)}
        >
          <AiAgentObjectFieldBuilder name={name} index={row.index} />
        </AiAgentRow>
      ))}
    </AiAgentRowList>
  );
};
