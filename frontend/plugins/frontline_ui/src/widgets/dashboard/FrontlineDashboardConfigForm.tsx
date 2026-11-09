import { SOURCE_OPTIONS } from '@/report/constants/data';
import {
  Button,
  Form,
  MultipleSelector,
  MultiSelectOption,
  Select,
} from 'erxes-ui';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TDashboardWidgetConfig } from 'ui-modules';
import { DASHBOARD_DATE_OPTIONS } from './frontlineDashboardConfig';
import { TFrontlineDashboardWidget } from './frontlineDashboardWidgets';
import {
  useFrontlineDashboardConfigForm,
  useFrontlineDashboardFilterOptions,
} from './useFrontlineDashboardConfigForm';

const ALL_SOURCES = 'all';

const IdsSelect = ({
  value,
  options,
  placeholder,
  disabled,
  onChange,
}: {
  value?: string[];
  options: MultiSelectOption[];
  placeholder: string;
  disabled?: boolean;
  onChange: (ids: string[]) => void;
}) => {
  const { t } = useTranslation('frontline');
  const selected = (value ?? []).map(
    (id) =>
      options.find((option) => option.value === id) ?? {
        value: id,
        label: id,
      },
  );

  return (
    <MultipleSelector
      value={selected}
      options={options}
      placeholder={placeholder}
      disabled={disabled}
      hidePlaceholderWhenSelected
      emptyIndicator={
        <p className="text-center text-sm text-muted-foreground">
          {t('dashboard.nothing-found')}
        </p>
      }
      onChange={(next) => onChange(next.map((option) => option.value))}
    />
  );
};

/** The date range and filters one frontline report tile is drawn with. */
export const FrontlineDashboardConfigForm = ({
  widget,
  config,
  onSubmit,
  onCancel,
}: Readonly<{
  widget: TFrontlineDashboardWidget;
  config?: TDashboardWidgetConfig | null;
  onSubmit: (config: TDashboardWidgetConfig) => void;
  onCancel: () => void;
}>) => {
  const { t } = useTranslation('frontline');
  const { form, submit } = useFrontlineDashboardConfigForm(
    widget,
    config,
    onSubmit,
  );
  const channelIds = useWatch({
    control: form.control,
    name: 'filters.channelIds',
  });
  const options = useFrontlineDashboardFilterOptions(widget.group, channelIds);
  const { group, visualTypes } = widget;

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Form.Field
          control={form.control}
          name="filters.date"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('date')}</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {DASHBOARD_DATE_OPTIONS.map((option) => (
                    <Select.Item key={option} value={option}>
                      {t(option)}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <Form.Message />
            </Form.Item>
          )}
        />

        {group === 'conversation' && (
          <Form.Field
            control={form.control}
            name="filters.source"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('source')}</Form.Label>
                <Select
                  value={field.value || ALL_SOURCES}
                  onValueChange={(value) =>
                    field.onChange(value === ALL_SOURCES ? undefined : value)
                  }
                >
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {SOURCE_OPTIONS.map((option) => (
                      <Select.Item key={option.value} value={option.value}>
                        {t(option.label)}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </Form.Item>
            )}
          />
        )}

        {group !== 'facebook' && (
          <Form.Field
            control={form.control}
            name="filters.channelIds"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('channels')}</Form.Label>
                <IdsSelect
                  value={field.value}
                  options={options.channelOptions}
                  placeholder={t('all-channels')}
                  disabled={options.channelsLoading}
                  onChange={(ids) => {
                    field.onChange(ids);
                    form.setValue('filters.pipelineIds', []);
                  }}
                />
              </Form.Item>
            )}
          />
        )}

        {group === 'ticket' && (
          <Form.Field
            control={form.control}
            name="filters.pipelineIds"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('pipelines')}</Form.Label>
                <IdsSelect
                  value={field.value}
                  options={options.pipelineOptions}
                  placeholder={
                    options.hasPipelineChannel
                      ? t('dashboard.all-pipelines')
                      : t('dashboard.pick-channel-first')
                  }
                  disabled={
                    !options.hasPipelineChannel || options.pipelinesLoading
                  }
                  onChange={field.onChange}
                />
              </Form.Item>
            )}
          />
        )}

        {group === 'facebook' && (
          <Form.Field
            control={form.control}
            name="filters.pageIds"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('facebook-page')}</Form.Label>
                <IdsSelect
                  value={field.value}
                  options={options.pageOptions}
                  placeholder={t('dashboard.all-pages')}
                  disabled={options.pagesLoading}
                  onChange={field.onChange}
                />
              </Form.Item>
            )}
          />
        )}

        {visualTypes && (
          <Form.Field
            control={form.control}
            name="visualType"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('dashboard.chart-type')}</Form.Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {visualTypes.map((visualType) => (
                      <Select.Item key={visualType} value={visualType}>
                        {t(visualType)}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </Form.Item>
            )}
          />
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Button type="submit">{t('dashboard.save-widget')}</Button>
        </div>
      </form>
    </Form>
  );
};
