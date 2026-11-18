import { toast } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  type IPropertyForm,
  PropertyForm,
  useAddProperty,
  useSidePanel,
  useSidePanelDraft,
} from 'ui-modules';
import { POS_CUSTOMER_FIELD_CONTENT_TYPE } from '@/pos/constants/posPanel';
import { posCustomerFormEditAtom } from '@/pos/states/posCustomerField';

type PosCustomerFieldDraft = {
  posId?: string;
};

const CUSTOMER_CONTENT_TYPE = 'core:customer';

const EMPTY_PROPERTY: IPropertyForm = {
  icon: '123',
  name: '',
  type: '',
  groupId: '',
  isSearchable: false,
  isVisible: true,
  isVisibleToCreate: false,
  isRequired: false,
  isVisibleInCard: false,
  description: '',
  code: '',
  options: [],
};

export const PosCustomerFieldPanelTitle = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });

  return t('add-property', 'Add Property');
};

export const PosCustomerFieldPanel = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { posId } = useSidePanelDraft<PosCustomerFieldDraft>(
    POS_CUSTOMER_FIELD_CONTENT_TYPE,
  );
  const { back, canGoBack, close } = useSidePanel();
  const { addProperty, loading } = useAddProperty();
  const setFormEdit = useSetAtom(posCustomerFormEditAtom);

  const cancel = () => (canGoBack ? back() : close());

  const onSubmit = (data: IPropertyForm) =>
    addProperty({
      variables: { ...data, contentType: CUSTOMER_CONTENT_TYPE },
      refetchQueries: ['Fields'],
      awaitRefetchQueries: true,
      onCompleted: (result: { fieldAdd?: { _id: string } }) => {
        toast({
          title: t('property-added', 'Property added'),
          variant: 'success',
        });

        if (posId && result.fieldAdd?._id) {
          setFormEdit({ posId, kind: 'field', fieldId: result.fieldAdd._id });
        }

        cancel();
      },
      onError: (error) =>
        toast({
          title: t('error', 'Error'),
          variant: 'destructive',
          description: error.message,
        }),
    });

  return (
    <PropertyForm
      layout="panel"
      onSubmit={onSubmit}
      loading={loading}
      defaultValues={EMPTY_PROPERTY}
      onCancel={cancel}
      contentType={CUSTOMER_CONTENT_TYPE}
    />
  );
};
