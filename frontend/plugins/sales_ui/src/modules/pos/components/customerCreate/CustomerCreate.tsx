import { PosSaveAction } from '@/pos/components/pos-edit/PosSaveAction';
import { PosSettingsSection } from '@/pos/components/pos-edit/PosSettingsSection';
import {
  PosSwitchList,
  PosSwitchRow,
} from '@/pos/components/pos-edit/PosSwitchRow';
import { usePosSettingsLabels } from '@/pos/hooks/usePosSettingsLabels';
import {
  IconAlertTriangle,
  IconLayoutRows,
  IconPlus,
} from '@tabler/icons-react';
import { Alert, Button, Form, Spinner, Switch } from 'erxes-ui';
import { useAtom } from 'jotai';
import { type ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Can, useSidePanel } from 'ui-modules';
import { POS_CUSTOMER_PROPERTY_PREFIX } from '@/pos/components/customerCreate/constants';
import {
  POS_CUSTOMER_FIELD_CONTENT_TYPE,
  POS_CUSTOMER_LAYOUT_CONTENT_TYPE,
} from '@/pos/constants/posPanel';
import { useCustomerCreateConfig } from '@/pos/hooks/useCustomerCreateConfig';
import { posCustomerFormEditAtom } from '@/pos/states/posCustomerField';

const CUSTOMER_CREATE_FORM_ID = 'pos-customer-create-form';

export const CustomerCreate = ({
  posId,
  onSaveActionChange,
}: {
  posId?: string;
  onSaveActionChange?: (action: ReactNode | null) => void;
}) => {
  const { t } = useTranslation('sales');
  const labels = usePosSettingsLabels();
  const { openNewRecord } = useSidePanel();
  const [formEdit, setFormEdit] = useAtom(posCustomerFormEditAtom);
  const {
    form,
    options,
    layout,
    placed,
    staleCodes,
    loading,
    error,
    saving,
    toggleField,
    isLocked,
    applyLayout,
    save,
  } = useCustomerCreateConfig(posId);
  const { control, handleSubmit, formState } = form;
  const isDirty = formState.isDirty || staleCodes.length > 0;

  useEffect(() => {
    if (loading || !formEdit || formEdit.posId !== posId) {
      return;
    }

    if (formEdit.kind === 'field') {
      toggleField(`${POS_CUSTOMER_PROPERTY_PREFIX}${formEdit.fieldId}`, true);
    } else {
      applyLayout(formEdit.layout);
    }

    setFormEdit(null);
  }, [applyLayout, formEdit, loading, posId, setFormEdit, toggleField]);

  useEffect(() => {
    if (!onSaveActionChange) {
      return;
    }

    onSaveActionChange(
      <PosSaveAction
        isDirty={isDirty}
        saving={saving}
        form={CUSTOMER_CREATE_FORM_ID}
      />,
    );

    return () => onSaveActionChange(null);
  }, [isDirty, onSaveActionChange, saving, t]);

  if (loading) {
    return <Spinner containerClassName="py-12" />;
  }

  if (error) {
    return (
      <p className="p-6 text-center text-destructive">
        {t('failed-to-load-pos-details', { message: error.message })}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form
          id={CUSTOMER_CREATE_FORM_ID}
          onSubmit={handleSubmit(save)}
          className="space-y-6"
        >
          <PosSwitchList>
            <PosSwitchRow
              control={control}
              name="enabled"
              label={t('enable-create-customer', 'Enable create customer')}
              description={t(
                'customer-create-permission-hint',
                'Admins can always add customers; cashiers need the permission on the Permission tab.',
              )}
            />
            <PosSwitchRow
              control={control}
              name="assignCashierAsOwner"
              label={t(
                'cashier-as-customer-owner',
                'Cashier becomes the owner of the customer',
              )}
            />
          </PosSwitchList>

          {staleCodes.length > 0 && (
            <Alert variant="warning">
              <IconAlertTriangle />
              <Alert.Title>
                {t('customer-form-stale-title', 'Some fields are gone')}
              </Alert.Title>
              <Alert.Description>
                {t(
                  'customer-form-stale-description',
                  '{{count}} properties were deleted or archived and no longer show on the form. Save to clean up the layout.',
                  { count: staleCodes.length },
                )}
              </Alert.Description>
            </Alert>
          )}

          <PosSettingsSection
            separated
            title={t('form-fields', 'Form fields')}
            description={labels.customerFormDescription}
            actions={
              <>
                <Can action="fieldsManage">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      openNewRecord(
                        POS_CUSTOMER_FIELD_CONTENT_TYPE,
                        { posId },
                        { stack: true },
                      )
                    }
                  >
                    <IconPlus />
                    {t('add-field', 'Add field')}
                  </Button>
                </Can>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!layout.length}
                  onClick={() =>
                    openNewRecord(
                      POS_CUSTOMER_LAYOUT_CONTENT_TYPE,
                      { posId, layout },
                      { stack: true },
                    )
                  }
                >
                  <IconLayoutRows />
                  {t('edit-layout', 'Edit layout')}
                </Button>
              </>
            }
          >
            <Form.Field
              control={control}
              name="layout"
              render={() => (
                <Form.Item>
                  <div className="grid grid-cols-1 gap-0.5 @2xl:grid-cols-3">
                    {options.map((option) => (
                      <div
                        key={option.code}
                        className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent/50"
                      >
                        <span className="min-w-0 flex-1 truncate text-xs font-medium">
                          {option.name}
                        </span>
                        {option.isProperty && (
                          <span className="text-xs text-muted-foreground">
                            {t('property', 'Property')}
                          </span>
                        )}
                        <Switch
                          checked={placed.has(option.code)}
                          disabled={isLocked(option.code)}
                          onCheckedChange={(checked) =>
                            toggleField(option.code, checked)
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </PosSettingsSection>
        </form>
      </Form>
    </div>
  );
};
