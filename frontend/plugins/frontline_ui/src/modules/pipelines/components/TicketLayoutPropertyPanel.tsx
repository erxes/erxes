import { SettingsLocalPanel } from '@/settings/components/SettingsLocalPanel';
import { TICKET_PROPERTY_CONTENT_TYPE } from '@/ticket/constants/createLayout';
import { Sheet, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  type IPropertyForm,
  PropertyForm,
  RecordSidePanel,
  useAddProperty,
} from 'ui-modules';

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

export const TicketLayoutPropertyPanel = ({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (fieldId: string) => Promise<void>;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { addProperty, loading } = useAddProperty();
  const onClose = () => onOpenChange(false);
  const onSubmit = (data: IPropertyForm) =>
    addProperty({
      variables: { ...data, contentType: TICKET_PROPERTY_CONTENT_TYPE },
      refetchQueries: ['Fields'],
      awaitRefetchQueries: true,
      onCompleted: async (result) => {
        toast({
          title: t('property-added', 'Property added'),
          variant: 'success',
        });
        if (result.fieldAdd?._id) await onCreated(result.fieldAdd._id);
        onClose();
      },
      onError: (error) =>
        toast({
          title: t('error', 'Error'),
          variant: 'destructive',
          description: error.message,
        }),
    });

  return (
    <SettingsLocalPanel open={open} onOpenChange={onOpenChange}>
      <RecordSidePanel.Header
        title={t('add-property', 'Add Property')}
        onClose={onClose}
      />
      <Sheet open={open} onOpenChange={onOpenChange}>
        <div className="flex min-h-0 flex-1 flex-col [&>form>div:first-child]:hidden">
          <PropertyForm
            onSubmit={onSubmit}
            loading={loading}
            defaultValues={EMPTY_PROPERTY}
            onCancel={onClose}
            contentType={TICKET_PROPERTY_CONTENT_TYPE}
          />
        </div>
      </Sheet>
    </SettingsLocalPanel>
  );
};
