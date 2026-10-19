import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconCircleCheckFilled,
  IconExternalLink,
  IconFileTypeJs,
  IconLoader2,
  IconUpload,
} from '@tabler/icons-react';
import {
  Badge,
  Button,
  cn,
  Form,
  Spinner,
  Textarea,
  useConfirm,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { DragEvent, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { currentUserState, useVersion } from 'ui-modules';
import { useConfig } from '@/settings/file-upload/hook/useConfigs';
import {
  getMobilePushConfigSchema,
  MOBILE_PUSH_CONFIG_CODE,
  parseServiceAccount,
  TMobilePushConfigForm,
} from '../schema/mobilePushConfigSchema';

// `_` lets Firebase ask which project to open
const FIREBASE_SERVICE_ACCOUNTS_URL =
  'https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk';

export const NotificationMobilePushConfig = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const currentUser = useAtomValue(currentUserState);
  const isOs = useVersion();
  const { configs, loading, isLoading, updateConfig } = useConfig();
  const { confirm } = useConfirm();
  const fileInput = useRef<HTMLInputElement>(null);
  const [replacing, setReplacing] = useState(false);
  const [pasting, setPasting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const schema = useMemo(() => getMobilePushConfigSchema(t), [t]);
  const form = useForm<TMobilePushConfigForm>({
    resolver: zodResolver(schema),
    defaultValues: { serviceAccount: '' },
  });
  const draft = useWatch({ control: form.control, name: 'serviceAccount' });

  if (!currentUser?.isOwner || !isOs) {
    return <Navigate to="/settings/notification" replace />;
  }

  if (loading) {
    return <Spinner />;
  }

  const savedValue = (configs as { code: string; value: unknown }[] | undefined)
    ?.find((config) => config.code === MOBILE_PUSH_CONFIG_CODE)
    ?.value;
  const saved = savedValue ? parseServiceAccount(String(savedValue)) : null;
  const draftAccount = schema.safeParse({ serviceAccount: draft }).success
    ? parseServiceAccount(draft)
    : null;
  const showForm = !saved || replacing;

  const loadFile = async (file?: File) => {
    if (!file) return;

    setFileName(file.name);
    form.setValue('serviceAccount', await file.text(), {
      shouldValidate: true,
    });
  };

  const onDrop = (e: DragEvent<HTMLElement>) => {
    const file = e.dataTransfer.files?.[0];

    setDragging(false);

    if (file) {
      e.preventDefault();
      loadFile(file);
    }
  };

  const clearDraft = () => {
    form.reset();
    setFileName(null);
  };

  const onSubmit = async ({ serviceAccount }: TMobilePushConfigForm) => {
    const result = await updateConfig(
      // stored on one line so the escaped private key newlines survive
      { [MOBILE_PUSH_CONFIG_CODE]: JSON.stringify(JSON.parse(serviceAccount)) },
      { skipConfirm: true },
    );

    if (result?.data) {
      clearDraft();
      setPasting(false);
      setReplacing(false);
    }
  };

  const onRemove = () =>
    confirm({
      message: t('remove-key-confirm'),
      options: { okLabel: t('remove-key'), variants: { ok: 'destructive' } },
    }).then(() =>
      updateConfig({ [MOBILE_PUSH_CONFIG_CODE]: '' }, { skipConfirm: true }),
    );

  const onCancel = () => {
    clearDraft();
    setPasting(false);
    setReplacing(false);
  };

  const togglePasting = () => {
    clearDraft();
    setPasting((value) => !value);
  };

  return (
    <div className="mx-auto px-4 py-10 max-w-2xl">
      <div className="bg-card border border-border rounded-xl">
        <div className="flex justify-between items-start gap-4 px-4 py-4">
          <div>
            <p className="font-semibold text-sm tracking-tight">
              {t('mobile-push')}
            </p>
            <p className="text-muted-foreground text-xs">
              {t('mobile-push-description')}
            </p>
          </div>
          <Badge variant={saved ? 'success' : 'secondary'}>
            {saved ? t('connected') : t('not-configured')}
          </Badge>
        </div>

        {saved && (
          <div className="flex flex-wrap justify-between items-center gap-3 px-4 py-3 border-t">
            <dl className="gap-x-4 gap-y-1 grid grid-cols-[auto_1fr] min-w-0 text-xs">
              <dt className="text-muted-foreground">{t('firebase-project')}</dt>
              <dd className="font-medium truncate">
                {String(saved.project_id)}
              </dd>
              <dt className="text-muted-foreground">{t('service-account')}</dt>
              <dd className="font-medium truncate">
                {String(saved.client_email)}
              </dd>
            </dl>
            {!replacing && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setReplacing(true)}>
                  {t('replace-key')}
                </Button>
                <Button
                  variant="ghost"
                  className="text-destructive"
                  disabled={isLoading}
                  onClick={onRemove}
                >
                  {t('remove-key')}
                </Button>
              </div>
            )}
          </div>
        )}

        {showForm && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4 px-4 py-4 border-t"
            >
              <div className="space-y-2">
                <p className="font-medium text-sm">{t('get-key-title')}</p>
                <ol className="space-y-1 pl-4 text-muted-foreground text-xs list-decimal">
                  <li>
                    {t('get-key-step-open')}{' '}
                    <a
                      href={FIREBASE_SERVICE_ACCOUNTS_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline"
                    >
                      {t('open-firebase-console')}
                      <IconExternalLink size={12} />
                    </a>
                  </li>
                  <li>{t('get-key-step-generate')}</li>
                  <li>{t('get-key-step-upload')}</li>
                </ol>
              </div>

              <Form.Field
                control={form.control}
                name="serviceAccount"
                render={({ field }) => (
                  <Form.Item>
                    {/* a valid key collapses to a summary so the private key leaves the screen */}
                    {draftAccount ? (
                      <div className="flex items-center gap-3 bg-success/5 px-3 py-3 border border-success/30 rounded-lg">
                        <IconCircleCheckFilled
                          size={20}
                          className="flex-none text-success"
                        />
                        <div className="flex-1 min-w-0 text-xs">
                          <p className="font-medium truncate">
                            {fileName || t('service-account-json')}
                          </p>
                          <p className="text-muted-foreground truncate">
                            {String(draftAccount.project_id)} ·{' '}
                            {String(draftAccount.client_email)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={clearDraft}
                        >
                          {t('clear')}
                        </Button>
                      </div>
                    ) : pasting ? (
                      <Form.Control>
                        <Textarea
                          {...field}
                          rows={8}
                          autoFocus
                          onDrop={onDrop}
                          className="font-mono text-xs"
                          placeholder={t('service-account-placeholder')}
                        />
                      </Form.Control>
                    ) : (
                      <Form.Control>
                        <button
                          type="button"
                          onClick={() => fileInput.current?.click()}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragging(true);
                          }}
                          onDragLeave={() => setDragging(false)}
                          onDrop={onDrop}
                          className={cn(
                            'flex flex-col items-center gap-2 px-4 py-8 border border-dashed rounded-lg w-full text-center transition-colors duration-150 cursor-pointer',
                            'focus-visible:outline-2 focus-visible:outline-ring/70 focus-visible:outline-offset-2',
                            dragging
                              ? 'border-primary bg-primary/5'
                              : 'hover:border-foreground/30 hover:bg-muted/40',
                          )}
                        >
                          <span
                            className={cn(
                              'flex justify-center items-center rounded-full size-9 transition-colors',
                              dragging
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted text-muted-foreground',
                            )}
                          >
                            {dragging ? (
                              <IconFileTypeJs size={18} />
                            ) : (
                              <IconUpload size={18} />
                            )}
                          </span>
                          <span className="font-medium text-sm">
                            {t('drop-key-file')}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {t('drop-key-file-hint')}
                          </span>
                        </button>
                      </Form.Control>
                    )}
                    <input
                      ref={fileInput}
                      type="file"
                      accept="application/json,.json"
                      className="hidden"
                      onChange={(e) => {
                        loadFile(e.target.files?.[0]);
                        e.target.value = '';
                      }}
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <div className="flex justify-between items-center gap-2">
                <Button
                  type="button"
                  variant="link"
                  className="text-muted-foreground"
                  onClick={togglePasting}
                >
                  {pasting ? t('upload-file-instead') : t('paste-json-instead')}
                </Button>
                <div className="flex gap-2">
                  {replacing && (
                    <Button type="button" variant="ghost" onClick={onCancel}>
                      {t('cancel')}
                    </Button>
                  )}
                  <Button type="submit" disabled={isLoading || !draft}>
                    {isLoading && <IconLoader2 className="animate-spin" />}
                    {t('save-key')}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
};
