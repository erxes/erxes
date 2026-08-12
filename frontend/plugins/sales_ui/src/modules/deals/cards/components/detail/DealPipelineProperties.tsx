import { usePipelineDetail } from '@/deals/boards/hooks/usePipelines';
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

const CONTENT_TYPE = 'sales:deal';

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

export const DealPipelineProperties = (props: Props) => {
  const { t } = useTranslation('sales');
  const { pipelineDetail, loading: pipelineLoading } = usePipelineDetail({
    variables: { _id: props.pipelineId },
  });
  const { fieldGroups, loading: groupsLoading } = useFieldGroups({
    contentType: CONTENT_TYPE,
    limit: 100,
  });
  const selectedIds = new Set(pipelineDetail?.propertyIds || []);

  if (
    !pipelineLoading &&
    pipelineDetail?.isPropertySelectionConfigured === false
  ) {
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
    <InfoCard title={t('properties')}>
      <InfoCard.Content>
        {pipelineLoading || groupsLoading ? (
          <Spinner containerClassName="py-8" />
        ) : selectedIds.size === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('configure-properties-in-settings')}
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
