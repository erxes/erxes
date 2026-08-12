import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import { Button, Collapsible, InfoCard, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  FieldsInGroup,
  IFieldGroup,
  MultipleFieldsInGroup,
  FieldsInDetail,
  mutateFunction,
  useFieldGroups,
  useFields,
} from 'ui-modules';

const CONTENT_TYPE = 'frontline:ticket';

type Props = {
  id: string;
  pipelineId: string;
  propertiesData: Record<string, unknown>;
  mutateHook: () => { mutate: mutateFunction; loading: boolean };
};

const SelectedGroup = ({
  group,
  selectedIds,
  ...props
}: Props & { group: IFieldGroup; selectedIds: Set<string> }) => {
  const { fields, loading } = useFields({
    groupId: group._id,
    contentType: CONTENT_TYPE,
  });
  const selectedFields = fields.filter(
    (field) => selectedIds.has(field._id) && field.isVisible !== false,
  );

  if (loading) return <Spinner containerClassName="py-4" />;
  if (!selectedFields.length) return null;

  if (group.configs?.isMultiple) {
    return (
      <MultipleFieldsInGroup
        group={group}
        fields={selectedFields}
        contentType={CONTENT_TYPE}
        {...props}
      />
    );
  }

  return (
    <Collapsible defaultOpen>
      <Collapsible.Trigger asChild>
        <Button variant="secondary" className="justify-start w-full">
          <Collapsible.TriggerIcon />
          {group.name}
        </Button>
      </Collapsible.Trigger>
      <Collapsible.Content className="pt-4">
        <FieldsInGroup
          group={group}
          fields={selectedFields}
          contentType={CONTENT_TYPE}
          {...props}
        />
      </Collapsible.Content>
    </Collapsible>
  );
};

export const TicketPipelineProperties = (props: Props) => {
  const { t } = useTranslation(['frontline', 'common']);
  const { pipeline, loading: pipelineLoading } = useGetPipeline(
    props.pipelineId,
  );
  const { fieldGroups, loading: groupsLoading } = useFieldGroups({
    contentType: CONTENT_TYPE,
    limit: 100,
  });
  const selectedIds = new Set(pipeline?.propertyIds || []);

  if (!pipelineLoading && pipeline?.isPropertySelectionConfigured === false) {
    return (
      <FieldsInDetail
        fieldContentType={CONTENT_TYPE}
        propertiesData={props.propertiesData}
        mutateHook={props.mutateHook}
        id={props.id}
      />
    );
  }

  return (
    <InfoCard title={t('common:properties')}>
      <InfoCard.Content>
        {pipelineLoading || groupsLoading ? (
          <Spinner containerClassName="py-8" />
        ) : selectedIds.size === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('no-ticket-property-fields')}
          </p>
        ) : (
          fieldGroups.map((group) => (
            <SelectedGroup
              key={group._id}
              group={group}
              selectedIds={selectedIds}
              {...props}
            />
          ))
        )}
      </InfoCard.Content>
    </InfoCard>
  );
};
