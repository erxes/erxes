import { TICKET_PROPERTY_CONTENT_TYPE } from '@/ticket/constants/createLayout';
import { InfoCard, Spinner } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FieldsInGroup,
  MultipleFieldsInGroup,
  PropertyGroupCard,
  PropertyGroupShell,
  mutateFunction,
  useFieldGroups,
  useFields,
} from 'ui-modules';

const PROPERTY_LIMIT = 100;

type Props = {
  id: string;
  propertiesData: Record<string, unknown>;
  mutateHook: () => { mutate: mutateFunction; loading: boolean };
};

/**
 * Settings → Properties as is: each field in its own group, whatever the
 * pipeline. The create form layout never moves or hides a field here.
 */
const useTicketDetailFields = () => {
  const { fieldGroups, loading: groupsLoading } = useFieldGroups({
    contentType: TICKET_PROPERTY_CONTENT_TYPE,
    limit: PROPERTY_LIMIT,
  });
  const { fields, loading: fieldsLoading } = useFields({
    contentType: TICKET_PROPERTY_CONTENT_TYPE,
    limit: PROPERTY_LIMIT,
  });

  return useMemo(
    () => ({
      loading: groupsLoading || fieldsLoading,
      groups: fieldGroups
        .map((group) => ({
          group,
          fields: fields.filter(
            (field) =>
              field.groupId === group._id && field.isVisible !== false,
          ),
        }))
        .filter(({ fields: groupFields }) => groupFields.length),
    }),
    [fieldGroups, fields, groupsLoading, fieldsLoading],
  );
};

export const TicketPipelineProperties = (props: Props) => {
  const { t } = useTranslation(['frontline', 'common']);
  const { loading, groups } = useTicketDetailFields();
  const fieldProps = { ...props, contentType: TICKET_PROPERTY_CONTENT_TYPE };

  if (loading) {
    return <Spinner containerClassName="py-8" />;
  }

  if (!groups.length) {
    return (
      <InfoCard title={t('common:properties')}>
        <InfoCard.Content>
          <p className="text-sm text-muted-foreground">
            {t(
              'no-ticket-detail-fields',
              'No properties to show. Mark them visible in Settings → Properties.',
            )}
          </p>
        </InfoCard.Content>
      </InfoCard>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map(({ group, fields }) =>
        group.configs?.isMultiple ? (
          <MultipleFieldsInGroup
            key={group._id}
            group={group}
            fields={fields}
            {...fieldProps}
          />
        ) : (
          <PropertyGroupShell key={group._id} group={group}>
            <PropertyGroupCard>
              <FieldsInGroup group={group} fields={fields} {...fieldProps} />
            </PropertyGroupCard>
          </PropertyGroupShell>
        ),
      )}
    </div>
  );
};
