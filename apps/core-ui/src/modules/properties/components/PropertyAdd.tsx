import type { ContentType } from '@erxes/core-contract';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PROPERTIES_BASE_PATH } from '../constants';
import { hasOptions } from '../fieldTypes';
import { useAddProperty } from '../usePropertyMutations';
import { PropertyForm } from './PropertyForm';

/** Add a property (`/:type/add`, or `/:type/:groupId/add` for a group). */
export const PropertyAdd = ({ contentType }: { contentType: ContentType }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { groupId } = useParams<{ groupId: string }>();
  const { toast } = useToast();
  const { mutate, isPending } = useAddProperty();
  const navigate = useNavigate();
  const handleClose = () => navigate(`${PROPERTIES_BASE_PATH}/${contentType}`);

  return (
    <PropertyForm
      key={`${contentType}-${groupId ?? ''}`}
      contentType={contentType}
      loading={isPending}
      onCancel={handleClose}
      defaultValues={{
        icon: '',
        name: '',
        code: '',
        description: '',
        groupId: groupId ?? '',
        type: 'text',
        validation: null,
        isVisible: true,
        options: [],
      }}
      onSubmit={(data) =>
        mutate(
          {
            contentType,
            label: data.name,
            type: data.type,
            options: hasOptions(data.type) ? (data.options ?? []).map((option) => option.value) : undefined,
            groupId: data.groupId,
            code: data.code,
            description: data.description || null,
            icon: data.icon || null,
            validation: data.validation ?? null,
            isVisible: data.isVisible,
          },
          {
            onSuccess: () => {
              toast({ title: t('property-added', 'Property added'), variant: 'success' });
              handleClose();
            },
          },
        )
      }
    />
  );
};
