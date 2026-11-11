import type { ContentType } from '@erxes/core-contract';
import { useQuery } from '@tanstack/react-query';
import { Button, Spinner, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '~/lib/api';
import { PROPERTIES_BASE_PATH } from '../constants';
import { hasOptions } from '../fieldTypes';
import { FIELDS_KEY, useAllFields } from '../useFields';
import { useEditProperty } from '../usePropertyMutations';
import { PropertyForm } from './PropertyForm';

/** Edit a property (`/:type/:groupId/:id`). */
export const PropertyEdit = ({ contentType }: { contentType: ContentType }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { id = '' } = useParams<{ id: string }>();
  const { fields, loading } = useAllFields(contentType);
  const field = fields.find((item) => item.id === id);
  const usage = useQuery({
    queryKey: [...FIELDS_KEY, 'usage', 'field', id],
    queryFn: () => api.fields.usage({ ids: id }),
    enabled: !!field,
    staleTime: 0,
  });
  const { toast } = useToast();
  const { mutate, isPending } = useEditProperty();
  const navigate = useNavigate();
  const handleClose = () => navigate(`${PROPERTIES_BASE_PATH}/${contentType}`);

  if (loading || (field && usage.isPending && usage.fetchStatus !== 'idle')) {
    return <Spinner containerClassName="py-12" />;
  }

  if (!field) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
        {t('no-fields-found', 'No fields found')}
        <Button variant="secondary" asChild>
          <Link to={`${PROPERTIES_BASE_PATH}/${contentType}`}>{t('cancel', 'Cancel')}</Link>
        </Button>
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
            ...(hasOptions(data.type) ? { options: (data.options ?? []).map((option) => option.value) } : {}),
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
