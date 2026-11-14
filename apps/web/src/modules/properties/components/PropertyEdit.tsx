import type { FieldContentType } from '@erxes/core-contract';
import { skipToken, useQuery } from '@tanstack/react-query';
import { Spinner, useToast, buttonVariants } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { propertiesPath } from '../constants';
import { hasOptions } from '../fieldTypes';
import { useAllFields } from '../useFields';
import { useEditProperty } from '../usePropertyMutations';
import { PropertyForm } from './PropertyForm';

/** Edit a property (`/:type/:groupId/:id`). */
export const PropertyEdit = ({ contentType }: { contentType: FieldContentType }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { id = '' } = useParams<{ id: string }>();
  const { fields, loading, error } = useAllFields(contentType);
  const field = fields.find((item) => item.id === id);

  const usage = useQuery(
    orpc.fields.usage.queryOptions({ input: field ? { ids: id } : skipToken, staleTime: 0 }),
  );

  const { toast } = useToast();
  const { mutate, isPending } = useEditProperty();
  const navigate = useNavigate();

  const handleClose = () => {
    void navigate(propertiesPath(contentType));
  };

  if (error) {
    return <p className="py-12 text-center text-sm text-destructive">{messageOf(error)}</p>;
  }

  if (loading || (field && usage.isPending && usage.fetchStatus !== 'idle')) {
    return <Spinner area="lg" />;
  }

  if (!field) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
        {t('no-fields-found', 'No fields found')}
        <Link to={propertiesPath(contentType)} className={buttonVariants({ variant: 'secondary' })}>
          {t('cancel', 'Cancel')}
        </Link>
      </div>
    );
  }

  return (
    <PropertyForm
      key={field.id}
      isEdit
      fieldId={field.id}
      contentType={contentType}
      loading={isPending}
      onCancel={handleClose}
      usage={usage.data}
      usageLoading={usage.isFetching}
      usageFailed={usage.isError}
      defaultValues={{
        icon: field.icon ?? '',
        name: field.label,
        code: field.code ?? '',
        description: field.description ?? '',
        groupId: field.groupId ?? '',
        type: field.type,
        validation: field.validation,
        isVisible: field.isVisible,
        options: field.options.map((value) => ({ value })),
      }}
      onSubmit={(data) =>
        mutate(
          {
            id: field.id,
            label: data.name,
            type: data.type,
            ...(hasOptions(data.type)
              ? { options: (data.options ?? []).map((option) => option.value) }
              : {}),
            groupId: data.groupId,
            code: data.code,
            description: data.description || null,
            icon: data.icon || null,
            validation: data.validation ?? null,
            isVisible: data.isVisible,
          },
          {
            onSuccess: () => {
              toast({ title: t('property-updated', 'Property updated'), variant: 'success' });
              handleClose();
            },
          },
        )
      }
    />
  );
};
