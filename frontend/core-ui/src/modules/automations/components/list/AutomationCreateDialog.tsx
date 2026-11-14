import {
  AUTOMATION_GALLERY_PATH,
  AUTOMATION_SCRATCH_PATH,
  TAutomationCreateDialogState,
  TAutomationTemplateOption,
} from '@/automations/hooks/useAutomationCreateDialog';
import { IconArrowRight, IconPlus } from '@tabler/icons-react';
import { Dialog, IconComponent, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const SKELETON_KEYS = ['a', 'b', 'c', 'd'];

const TemplateOption = ({ option }: { option: TAutomationTemplateOption }) => (
  <Link
    to={option.href}
    className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
  >
    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
      <IconComponent name={option.icon} className="size-4" />
    </span>
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="truncate text-sm font-medium">{option.name}</span>
      {option.description && (
        <span className="line-clamp-2 text-xs text-muted-foreground">
          {option.description}
        </span>
      )}
    </span>
  </Link>
);

const TemplateOptionsLoading = () => (
  <div className="grid gap-2 sm:grid-cols-2">
    {SKELETON_KEYS.map((key) => (
      <Skeleton key={key} className="h-16 rounded-lg" />
    ))}
  </div>
);

const TemplateOptions = ({
  templateOptions,
  loading,
  error,
}: Pick<
  TAutomationCreateDialogState,
  'templateOptions' | 'loading' | 'error'
>) => {
  const { t } = useTranslation('automations');

  if (loading) {
    return <TemplateOptionsLoading />;
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        {t('create-dialog-templates-error')}
      </p>
    );
  }

  if (!templateOptions.length) {
    return (
      <p className="text-sm text-muted-foreground">
        {t('create-dialog-no-templates')}
      </p>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {templateOptions.map((option) => (
        <TemplateOption key={option.key} option={option} />
      ))}
    </div>
  );
};

/** Create starts with a choice: a blank automation, or a template. */
export const AutomationCreateDialog = ({
  state,
}: {
  state: TAutomationCreateDialogState;
}) => {
  const { t } = useTranslation('automations');
  const {
    open,
    setOpen,
    canInstall,
    templateOptions,
    galleryLabelKey,
    loading,
    error,
  } = state;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Content className="sm:max-w-2xl">
        <Dialog.HeaderCombined
          title={t('create-dialog-title')}
          description={t('create-dialog-description')}
        />
        <div className="flex flex-col gap-5">
          <Link
            to={AUTOMATION_SCRATCH_PATH}
            className="flex items-center gap-3 rounded-lg border border-dashed p-4 transition-colors hover:bg-accent"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
              <IconPlus className="size-4" />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">
                {t('create-dialog-scratch')}
              </span>
              <span className="text-xs text-muted-foreground">
                {t('create-dialog-scratch-description')}
              </span>
            </span>
          </Link>

          {canInstall && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('create-dialog-from-template')}
                </span>
                <Link
                  to={AUTOMATION_GALLERY_PATH}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  {t(galleryLabelKey)}
                  <IconArrowRight className="size-3" />
                </Link>
              </div>
              <TemplateOptions
                templateOptions={templateOptions}
                loading={loading}
                error={error}
              />
            </div>
          )}
        </div>
      </Dialog.Content>
    </Dialog>
  );
};
