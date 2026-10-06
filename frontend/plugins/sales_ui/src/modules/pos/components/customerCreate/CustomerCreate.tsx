import {
  IconAlertTriangle,
  IconLayoutRows,
  IconPlus,
} from '@tabler/icons-react';
import {
  Alert,
  Button,
  Form,
  InfoCard,
  Label,
  Spinner,
  Switch,
} from 'erxes-ui';
import { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Can, PropertyAddSheet } from 'ui-modules';
import { CustomerLayoutSheet } from '@/pos/components/customerCreate/CustomerLayoutSheet';
import { POS_CUSTOMER_PROPERTY_PREFIX } from '@/pos/components/customerCreate/constants';
import { useCustomerCreateConfig } from '@/pos/hooks/useCustomerCreateConfig';

const CUSTOMER_CREATE_FORM_ID = 'pos-customer-create-form';

export const CustomerCreate = ({
  posId,
  onSaveActionChange,
}: {
  posId?: string;
  onSaveActionChange?: (action: ReactNode | null) => void;
}) => {
  const { t } = useTranslation('sales');
  const [layoutOpen, setLayoutOpen] = useState(false);
  const [addFieldOpen, setAddFieldOpen] = useState(false);
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
    if (!onSaveActionChange) {
      return;
    }

    onSaveActionChange(
      isDirty ? (
        <Button
          type="submit"
          form={CUSTOMER_CREATE_FORM_ID}
          size="sm"
          disabled={saving}
        >
          {saving ? t('saving') : t('save-changes')}
        </Button>
      ) : null,
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
    <div className="p-6">
      <InfoCard title={t('customer-registration', 'Customer registration')}>
        <InfoCard.Content>
          <Form {...form}>
            <form
              id={CUSTOMER_CREATE_FORM_ID}
              onSubmit={handleSubmit(save)}
              className="space-y-6"
            >
              <div className="flex flex-wrap gap-8 items-center">
                <Form.Field
                  control={control}
                  name="enabled"
                  render={({ field }) => (
                    <Form.Item className="flex gap-2 items-center">
                      <Form.Control>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </Form.Control>
                      <Label className="text-xs">
                        {t('enable-create-customer', 'Enable create customer')}
                      </Label>
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={control}
                  name="assignCashierAsOwner"
                  render={({ field }) => (
                    <Form.Item className="flex gap-2 items-center">
                      <Form.Control>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </Form.Control>
                      <Label className="text-xs">
                        {t(
                          'cashier-as-customer-owner',
                          'Cashier becomes the owner of the customer',
                        )}
                      </Label>
                    </Form.Item>
                  )}
                />
              </div>

              <p className="text-sm text-muted-foreground">
                {t(
                  'customer-create-permission-hint',
                  'Admins can always add customers; cashiers need the permission on the Permission tab.',
                )}
              </p>

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

              <Form.Field
                control={control}
                name="layout"
                render={() => (
                  <Form.Item className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>{t('form-fields', 'Form fields')}</Label>
                      <div className="flex gap-2">
                        <Can action="fieldsManage">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setAddFieldOpen(true)}
                          >
                            <IconPlus />
                            {t('add-field', 'Add field')}
                          </Button>
                        </Can>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={!layout.length}
                          onClick={() => setLayoutOpen(true)}
                        >
                          <IconLayoutRows />
                          {t('edit-layout', 'Edit layout')}
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                      {options.map((option) => (
                        <div
                          key={option.code}
                          className="flex gap-2 items-center px-3 py-2 rounded-md border"
                        >
                          <Switch
                            checked={placed.has(option.code)}
                            disabled={isLocked(option.code)}
                            onCheckedChange={(checked) =>
                              toggleField(option.code, checked)
                            }
                          />
                          <span className="text-sm truncate">
                            {option.name}
                          </span>
                          {option.isProperty && (
                            <span className="ml-auto text-xs text-muted-foreground">
                              {t('property', 'Property')}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </form>
          </Form>
        </InfoCard.Content>
      </InfoCard>
      <CustomerLayoutSheet
        open={layoutOpen}
        layout={layout}
        options={options}
        onApply={applyLayout}
        onClose={() => setLayoutOpen(false)}
      />
      {/* Outside the form: a portaled sheet's submit still bubbles through React. */}
      <PropertyAddSheet
        contentType="core:customer"
        open={addFieldOpen}
        onClose={() => setAddFieldOpen(false)}
        onCreated={(fieldId) =>
          toggleField(`${POS_CUSTOMER_PROPERTY_PREFIX}${fieldId}`, true)
        }
      />
    </div>
  );
};
