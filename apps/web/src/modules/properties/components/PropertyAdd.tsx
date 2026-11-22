import type { PropertyContentType } from '@erxes/core-contract';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { propertyPaths } from '~/lib/paths';
import { fieldInputOf } from '../propertySchema';
import { useAddProperty } from '../usePropertyMutations';
import { PropertyForm } from './PropertyForm';

/** Add a property (`/:type/add`, or `/:type/:groupId/add` for a group). */
export const PropertyAdd = ({ contentType }: { contentType: PropertyContentType }) => {
  const { t } = useTranslation('workspace', { keyPrefix: 'properties' });
  const { groupId } = useParams<{ groupId: string }>();
  const { toast } = useToast();
  const { mutate, isPending } = useAddProperty();
  const navigate = useNavigate();

  const handleClose = () => {
    void navigate(propertyPaths(contentType).list);
  };

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
        isRequired: false,
        isVisibleToCreate: true,
        customerEditable: false,
        logic: { action: 'show', rules: [] },
        options: [],
      }}
      onSubmit={(data) =>
        mutate(
          { contentType, ...fieldInputOf(data) },
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
