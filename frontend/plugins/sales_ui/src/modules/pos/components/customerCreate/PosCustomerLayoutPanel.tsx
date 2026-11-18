import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { LayoutEditor, useSidePanel, useSidePanelDraft } from 'ui-modules';
import { PosPanelMissing } from '@/pos/components/PosPanelMissing';
import { POS_CUSTOMER_LAYOUT_CONTENT_TYPE } from '@/pos/constants/posPanel';
import { useCustomerFormFields } from '@/pos/hooks/useCustomerFormFields';
import { posCustomerFormEditAtom } from '@/pos/states/posCustomerField';

type PosCustomerLayoutDraft = {
  posId?: string;
  layout?: string[][];
};

export const PosCustomerLayoutPanelTitle = () => {
  const { t } = useTranslation('sales');

  return t('customer-form-layout', 'Customer form layout');
};

export const PosCustomerLayoutPanel = () => {
  const { t } = useTranslation('sales');
  const { posId, layout } = useSidePanelDraft<PosCustomerLayoutDraft>(
    POS_CUSTOMER_LAYOUT_CONTENT_TYPE,
  );
  const { back, canGoBack, close } = useSidePanel();
  const { options } = useCustomerFormFields();
  const setFormEdit = useSetAtom(posCustomerFormEditAtom);

  const done = () => (canGoBack ? back() : close());

  if (!posId || !layout) {
    return <PosPanelMissing onCancel={done} />;
  }

  const placed = new Set(layout.flat());

  return (
    <LayoutEditor
      layout="record"
      title={t('customer-form-layout', 'Customer form layout')}
      items={options
        .filter((option) => placed.has(option.code))
        .map(({ code, name }) => ({ id: code, name }))}
      initialRows={layout}
      saving={false}
      onSave={(rows) => {
        setFormEdit({ posId, kind: 'layout', layout: rows });
        done();
      }}
      onClose={done}
    />
  );
};
