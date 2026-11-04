import {
  Button,
  Dialog,
  Form,
  MultipleSelector,
  Select,
  Spinner,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSupportAccessApprove } from '@/settings/support-access/hooks/useSupportAccessApprove';
import { SUPPORT_GRANT_HOURS } from '@/settings/support-access/schema';

export const SupportAccessApproveDialog = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'support-access' });
  const { grant, form, options, approving, onSubmit, close } =
    useSupportAccessApprove();

  return (
    <Dialog open={!!grant} onOpenChange={(open) => !open && close()}>
      <Dialog.Content>
        <Dialog.HeaderCombined
          title={t('approve-title', { name: grant?.staffName })}
          description={t('approve-description')}
        />
        <Form {...form}>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Form.Field
              control={form.control}
              name="hours"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('duration')}</Form.Label>
                  <Select
                    value={String(field.value)}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <Form.Control>
                      <Select.Trigger>
                        <Select.Value />
                      </Select.Trigger>
                    </Form.Control>
                    <Select.Content>
                      {SUPPORT_GRANT_HOURS.map((hours) => (
                        <Select.Item key={hours} value={String(hours)}>
                          {t(`hours-${hours}`)}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="permissionGroupIds"
              render={({ field, fieldState }) => (
                <Form.Item>
                  <Form.Label>{t('approve-groups')}</Form.Label>
                  <Form.Description>
                    {t('approve-groups-description')}
                  </Form.Description>
                  <Form.Control>
                    <MultipleSelector
                      options={options}
                      value={options.filter((option) =>
                        field.value.includes(option.value),
                      )}
                      onChange={(selected) =>
                        field.onChange(selected.map((option) => option.value))
                      }
                      hidePlaceholderWhenSelected
                    />
                  </Form.Control>
                  {fieldState.error?.message && (
                    <p className="text-sm text-destructive">
                      {t(fieldState.error.message)}
                    </p>
                  )}
                </Form.Item>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={close}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={approving}>
                {approving && <Spinner size="sm" />}
                {t('approve')}
              </Button>
            </div>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
};
