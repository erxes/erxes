import { SelectCycleFormItem } from '@/task/components/task-selects/SelectCycle';
import { SelectProjectFormItem } from '@/task/components/task-selects/SelectProjectTask';
import { SelectTeam } from '@/team/components/SelectTeam';
import { useGetTeam } from '@/team/hooks/useGetTeam';
import { Button, Form, ToggleGroup } from 'erxes-ui';
import { ReactNode } from 'react';
import { FieldError } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { TDashboardWidgetConfig } from 'ui-modules';
import { useOperationDashboardConfigForm } from '~/widgets/dashboard/hooks/useOperationDashboardConfigForm';
import {
  TCycleDashboardConfig,
  cycleDashboardConfigSchema,
  projectDashboardConfigSchema,
} from '~/widgets/dashboard/operationDashboardConfig';

type TConfigFormProps = {
  config?: TDashboardWidgetConfig | null;
  onSubmit: (config: TDashboardWidgetConfig) => void;
  onCancel: () => void;
};

// Schema messages are translation keys, so they are translated here.
const ConfigFieldError = ({ error }: { error?: FieldError }) => {
  const { t } = useTranslation('operation');

  return error?.message ? (
    <p className="text-sm text-destructive">{t(error.message)}</p>
  ) : null;
};

const ConfigFormShell = ({
  onSubmit,
  onCancel,
  children,
}: {
  onSubmit: () => void;
  onCancel: () => void;
  children: ReactNode;
}) => {
  const { t } = useTranslation('operation');

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {children}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button type="submit">{t('save')}</Button>
      </div>
    </form>
  );
};

const toSingleValue = (value: string | string[]) =>
  Array.isArray(value) ? value[0] ?? '' : value;

export const ProjectDashboardConfigForm = ({
  config,
  onSubmit,
  onCancel,
}: TConfigFormProps) => {
  const { t } = useTranslation('operation');
  const { form, submit } = useOperationDashboardConfigForm(
    projectDashboardConfigSchema,
    config,
    { teamId: '', projectId: '' },
    onSubmit,
  );
  const teamId = form.watch('teamId');

  return (
    <Form {...form}>
      <ConfigFormShell onSubmit={submit} onCancel={onCancel}>
        <Form.Field
          control={form.control}
          name="teamId"
          render={({ field, fieldState }) => (
            <Form.Item>
              <Form.Label>{t('team')}</Form.Label>
              <SelectTeam.FormItem
                mode="single"
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(toSingleValue(value));
                  form.setValue('projectId', '');
                }}
              />
              <ConfigFieldError error={fieldState.error} />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="projectId"
          render={({ field, fieldState }) => (
            <Form.Item>
              <Form.Label>{t('project')}</Form.Label>
              {teamId ? (
                <SelectProjectFormItem
                  key={teamId}
                  teamId={teamId}
                  value={field.value}
                  onValueChange={(value) => field.onChange(value ?? '')}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t('dashboard.pick-team-first')}
                </p>
              )}
              <ConfigFieldError error={fieldState.error} />
            </Form.Item>
          )}
        />
      </ConfigFormShell>
    </Form>
  );
};

const CYCLE_DEFAULTS: TCycleDashboardConfig = {
  teamId: '',
  cycleMode: 'current',
  cycleId: '',
};

export const CycleDashboardConfigForm = ({
  config,
  onSubmit,
  onCancel,
}: TConfigFormProps) => {
  const { t } = useTranslation('operation');
  const { form, submit } = useOperationDashboardConfigForm(
    cycleDashboardConfigSchema,
    config,
    CYCLE_DEFAULTS,
    onSubmit,
  );
  const teamId = form.watch('teamId');
  const cycleMode = form.watch('cycleMode');
  const { team, loading: teamLoading } = useGetTeam(teamId || undefined);
  const noCycles = !!teamId && !teamLoading && !!team && !team.cycleEnabled;

  return (
    <Form {...form}>
      <ConfigFormShell onSubmit={submit} onCancel={onCancel}>
        <Form.Field
          control={form.control}
          name="teamId"
          render={({ field, fieldState }) => (
            <Form.Item>
              <Form.Label>{t('team')}</Form.Label>
              <SelectTeam.FormItem
                mode="single"
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(toSingleValue(value));
                  form.setValue('cycleId', '');
                }}
              />
              <ConfigFieldError error={fieldState.error} />
              {noCycles && (
                <p className="text-sm text-muted-foreground">
                  {t('dashboard.team-cycles-off')}
                </p>
              )}
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="cycleMode"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('cycle')}</Form.Label>
              <ToggleGroup
                type="single"
                variant="outline"
                size="sm"
                value={field.value}
                onValueChange={(value) => {
                  if (value === 'current' || value === 'pick') {
                    field.onChange(value);
                  }
                }}
              >
                <ToggleGroup.Item value="current" className="flex-auto">
                  {t('dashboard.current-cycle')}
                </ToggleGroup.Item>
                <ToggleGroup.Item value="pick" className="flex-auto">
                  {t('dashboard.specific-cycle')}
                </ToggleGroup.Item>
              </ToggleGroup>
            </Form.Item>
          )}
        />
        {cycleMode === 'pick' && (
          <Form.Field
            control={form.control}
            name="cycleId"
            render={({ field, fieldState }) => (
              <Form.Item>
                {teamId ? (
                  <SelectCycleFormItem
                    key={teamId}
                    teamId={teamId}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.pick-team-first')}
                  </p>
                )}
                <ConfigFieldError error={fieldState.error} />
              </Form.Item>
            )}
          />
        )}
      </ConfigFormShell>
    </Form>
  );
};
