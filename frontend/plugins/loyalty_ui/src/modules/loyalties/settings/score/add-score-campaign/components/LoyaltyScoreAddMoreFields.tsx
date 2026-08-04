import { UseFormReturn } from 'react-hook-form';
import {
  Button,
  Form,
  Input,
  Tabs,
  Popover,
  Command,
  Combobox,
  Switch,
  Textarea,
} from 'erxes-ui';
import { IconSettings } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { LoyaltyScoreFormValues } from '../../constants/formSchema';
import { SelectFieldGroup } from './selects/SelectFieldGroup';
import { SelectField } from './selects/SelectField';
import { useQuery } from '@apollo/client';
import { useEffect, useRef, useState } from 'react';
import { SCORE_CAMPAIGN_ATTRIBUTES_QUERY } from '../../graphql/queries/scoreCampaignAttributesQuery';
import { ServiceConfigSheet } from './ServiceConfigSheet';

const AttributionSelect = ({
  serviceName,
  onSelect,
}: {
  serviceName: string;
  onSelect: (value: string) => void;
}) => {
  const { t } = useTranslation('loyalty');
  const [open, setOpen] = useState(false);

  const { data } = useQuery(SCORE_CAMPAIGN_ATTRIBUTES_QUERY, {
    variables: { serviceName },
    skip: !serviceName,
  });

  const attributes: { label: string; value: string; group?: string }[] =
    data?.scoreCampaignAttributes || [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-primary text-sm font-normal"
        >
          {t('attribution')} ▾
        </Button>
      </Popover.Trigger>
      <Combobox.Content className="w-64">
        <Command>
          <Command.Input placeholder={t('type-to-search')} />
          <Command.List>
            <Command.Group heading={t('attributions')}>
              {attributes.map((attr) => (
                <Command.Item
                  key={attr.value}
                  value={attr.value}
                  onSelect={() => {
                    onSelect(`{{ ${attr.value} }}`);
                    setOpen(false);
                  }}
                >
                  {attr.label}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

const OWNER_TYPES = [
  { label: 'customers', value: 'customer' },
  { label: 'companies', value: 'company' },
  { label: 'team-members', value: 'user' },
];

const FieldNameSection = ({
  form,
  fieldGroupId,
  ownerType,
}: {
  form: UseFormReturn<LoyaltyScoreFormValues>;
  fieldGroupId: string;
  ownerType: string;
}) => {
  const { t } = useTranslation('loyalty');
  const fieldOrigin = form.watch('fieldOrigin') || 'new';
  const fieldName = form.watch('fieldName') || '';
  const fieldId = form.watch('fieldId') || '';
  const lastNewFieldName = useRef(fieldName);
  const lastExistingFieldId = useRef(fieldId);

  useEffect(() => {
    if (fieldOrigin === 'new') {
      lastNewFieldName.current = fieldName;
    }
  }, [fieldName, fieldOrigin]);

  useEffect(() => {
    if (fieldOrigin === 'exists') {
      lastExistingFieldId.current = fieldId;
    }
  }, [fieldId, fieldOrigin]);

  const setFieldTab = (tab: 'new' | 'exists') => {
    if (fieldOrigin === tab) {
      return;
    }

    if (fieldOrigin === 'new') {
      lastNewFieldName.current = form.getValues('fieldName') || '';
    }

    if (fieldOrigin === 'exists') {
      lastExistingFieldId.current = form.getValues('fieldId') || '';
    }

    form.setValue('fieldOrigin', tab, { shouldDirty: true });

    if (tab === 'new') {
      form.setValue('fieldName', lastNewFieldName.current, {
        shouldDirty: true,
        shouldValidate: true,
      });
      form.setValue('fieldId', '', { shouldDirty: false });
      return;
    }

    form.setValue('fieldId', lastExistingFieldId.current, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue('fieldName', '', { shouldDirty: false });
  };

  return (
    <div className="flex flex-col gap-2">
      <Form.Label>{t('field-name')}</Form.Label>
      <div className="flex gap-2">
        <button
          type="button"
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${fieldOrigin === 'new'
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground'
            }`}
          onClick={() => setFieldTab('new')}
        >
          {t('new')}
        </button>
        <button
          type="button"
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${fieldOrigin === 'exists'
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground'
            }`}
          onClick={() => setFieldTab('exists')}
        >
          {t('exists')}
        </button>
      </div>

      {fieldOrigin === 'new' ? (
        <Form.Field
          control={form.control}
          name="fieldName"
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <Input
                  {...field}
                  onChange={(event) => {
                    lastNewFieldName.current = event.target.value;
                    field.onChange(event);
                  }}
                  placeholder={t('enter-field-name')}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      ) : (
        <Form.Field
          control={form.control}
          name="fieldId"
          render={({ field }) => (
            <Form.Item>
              <SelectField.FormItem
                value={field.value || ''}
                onValueChange={(value) => {
                  lastExistingFieldId.current = value;
                  field.onChange(value);
                }}
                contentTypes={[`core:${ownerType}`]}
                groupId={fieldGroupId}
                placeholder={t('select-field')}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
      )}
    </div>
  );
};

export const LoyaltyScoreAddMoreFields = ({
  form,
}: {
  form: UseFormReturn<LoyaltyScoreFormValues>;
}) => {
  const { t } = useTranslation('loyalty');
  const selectedService = form.watch('conditions.serviceName');
  const selectedOwnerType = form.watch('ownerType');
  const selectedFieldGroupId = form.watch('fieldGroupId');
  const [serviceConfigOpen, setServiceConfigOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant={selectedService === 'sales' ? 'default' : 'outline'}
          onClick={() =>
            form.setValue('conditions.serviceName', 'sales', {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          className="justify-between"
        >
          <span>{t('sales-pipeline')}</span>
          {selectedService === 'sales' && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                setServiceConfigOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  setServiceConfigOpen(true);
                }
              }}
              className="inline-flex items-center justify-center rounded-md p-1 hover:bg-white/10"
              aria-label="Service configurations"
            >
              <IconSettings className="size-4" />
            </span>
          )}
        </Button>

        <Button
          type="button"
          variant={selectedService === 'pos' ? 'default' : 'outline'}
          onClick={() =>
            form.setValue('conditions.serviceName', 'pos', {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        >
          {t('pos-order')}
        </Button>
      </div>

      <ServiceConfigSheet
        form={form}
        open={serviceConfigOpen}
        onOpenChange={setServiceConfigOpen}
      />

      {selectedService && (
        <Tabs defaultValue="add" className="w-full">
          <Tabs.List>
            <Tabs.Trigger value="add">{t('add')}</Tabs.Trigger>
            <Tabs.Trigger value="subtract">{t('subtract')}</Tabs.Trigger>
            <Tabs.Trigger value="set">{t('set')}</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="add" className="pt-4">
            <div className="grid grid-cols-[1fr_120px] gap-4">
              <Form.Field
                control={form.control}
                name="add.placeholder"
                render={({ field }) => (
                  <Form.Item>
                    <div className="flex items-center gap-2">
                      <Form.Label>{t('score-value')}</Form.Label>
                      <AttributionSelect
                        serviceName={selectedService}
                        onSelect={(val) =>
                          field.onChange((field.value || '') + val)
                        }
                      />
                    </div>
                    <Form.Control>
                      <Textarea
                        {...field}
                        placeholder={t('enter-score-placeholder-add')}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="add.currencyRatio"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('currency-ratio')}</Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder={t('enter-currency-ratio')} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>
          </Tabs.Content>

          <Tabs.Content value="subtract" className="pt-4">
            <div className="grid grid-cols-[1fr_120px] gap-4">
              <Form.Field
                control={form.control}
                name="subtract.placeholder"
                render={({ field }) => (
                  <Form.Item>
                    <div className="flex items-center gap-2">
                      <Form.Label>{t('score-value')}</Form.Label>
                      <AttributionSelect
                        serviceName={selectedService}
                        onSelect={(val) =>
                          field.onChange((field.value || '') + val)
                        }
                      />
                    </div>
                    <Form.Control>
                      <Textarea
                        {...field}
                        placeholder={t('enter-score-placeholder-subtract')}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="subtract.currencyRatio"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('currency-ratio')}</Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder={t('enter-currency-ratio')} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="onlyClientPortal"
                render={({ field }) => (
                  <Form.Item className="flex flex-row items-center gap-2">
                    <Form.Control>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>
                    <Form.Label className="mb-2">
                      {t('only-client-portal-optional')}
                    </Form.Label>
                  </Form.Item>
                )}
              />
            </div>
          </Tabs.Content>

          <Tabs.Content value="set" className="pt-4">
            <div className="grid grid-cols-[1fr_120px] gap-4">
              <Form.Field
                control={form.control}
                name="set.placeholder"
                render={({ field }) => (
                  <Form.Item>
                    <div className="flex items-center gap-2">
                      <Form.Label>{t('score-value')}</Form.Label>
                      <AttributionSelect
                        serviceName={selectedService}
                        onSelect={(val) =>
                          field.onChange((field.value || '') + val)
                        }
                      />
                    </div>
                    <Form.Control>
                      <Textarea
                        {...field}
                        placeholder={t('enter-score-placeholder-set')}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="set.currencyRatio"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('currency-ratio')}</Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder={t('enter-currency-ratio')} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>
          </Tabs.Content>
        </Tabs>
      )
      }

      {
        selectedService && (
          <div className="flex flex-col gap-2">
            <Form.Label>{t('apply-score-to')}</Form.Label>
            <div className="grid grid-cols-3 gap-4">
              {OWNER_TYPES.map(({ label, value }) => (
                <Button
                  key={value}
                  type="button"
                  variant={selectedOwnerType === value ? 'default' : 'outline'}
                  onClick={() =>
                    form.setValue('ownerType', value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  {t(label)}
                </Button>
              ))}
            </div>
          </div>
        )
      }

      {
        selectedOwnerType && (
          <div className="grid grid-cols-2 gap-4">
            <Form.Field
              control={form.control}
              name="fieldGroupId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('field-group')}</Form.Label>
                  <SelectFieldGroup
                    value={field.value || ''}
                    onValueChange={field.onChange}
                    contentTypes={[`core:${selectedOwnerType}`]}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="onlyClientPortal"
              render={({ field }) => (
                <Form.Item className="flex flex-row items-center gap-2">
                  <Form.Control>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </Form.Control>
                  <Form.Label className="mb-2">
                    {t('only-client-portal-optional')}
                  </Form.Label>
                </Form.Item>
              )}
            />

          </div>
        )
      }

      {
        selectedOwnerType && selectedFieldGroupId && (
          <FieldNameSection
            form={form}
            fieldGroupId={selectedFieldGroupId}
            ownerType={selectedOwnerType}
          />
        )
      }
    </div >
  );
};
