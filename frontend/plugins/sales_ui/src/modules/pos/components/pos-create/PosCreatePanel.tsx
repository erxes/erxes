import { usePosCreateForm } from '@/pos/components/pos-create/usePosCreateForm';
import { IconAlignLeft, IconCashRegister } from '@tabler/icons-react';
import { Form, Input, Textarea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { POS_PANEL_INPUT_CLASS_NAME } from '@/pos/constants/posPanel';
import { PanelFormLayout, PanelFormRow, useSidePanel } from 'ui-modules';

export const PosCreatePanelTitle = () => {
  const { t } = useTranslation('sales');

  return t('pos-create');
};

export const PosCreatePanel = () => {
  const { t } = useTranslation('sales');
  const navigate = useNavigate();
  const { back, canGoBack, close } = useSidePanel();
  const { form, onSubmit, submitting } = usePosCreateForm((posId) => {
    if (posId) {
      navigate(`/sales/settings/pos/${posId}`);
    } else {
      close();
    }
  });
  const { errors } = form.formState;

  const cancel = () => (canGoBack ? back() : close());

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-1 min-h-0 flex-col">
        <PanelFormLayout
          onCancel={cancel}
          saving={submitting}
          saveLabel={t('pos-create')}
        >
          <PanelFormRow
            icon={IconCashRegister}
            label={t('name')}
            required
            error={errors.name?.message}
          >
            <Input
              {...form.register('name')}
              placeholder={t('pos-name-placeholder')}
              className={POS_PANEL_INPUT_CLASS_NAME}
              aria-invalid={!!errors.name}
            />
          </PanelFormRow>
          <PanelFormRow icon={IconAlignLeft} label={t('description')}>
            <Textarea
              {...form.register('description')}
              placeholder={t('pos-description-placeholder')}
              rows={3}
              className="min-h-14 resize-none border-0 text-xs shadow-none focus-visible:shadow-none hover:bg-accent focus-visible:bg-accent"
            />
          </PanelFormRow>
        </PanelFormLayout>
      </form>
    </Form>
  );
};
