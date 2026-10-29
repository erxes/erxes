import {
  IntegrationFormItem,
  INTEGRATION_CONTENT_TYPE,
  IntegrationEditButton,
} from '@/integrations/components/IntegrationPanelForm';

import {
  getSidePanelRecordPath,
  sidePanelDraftState,
  SelectBrands,
} from 'ui-modules';
import { FacebookIntegrationFormSheet } from './FacebookIntegrationForm';
import { IIntegration } from '@/integrations/types/Integration';
import {
  Button,
  Separator,
  Spinner,
  Form,
  Input,
  toast,
  Label,
} from 'erxes-ui';

import { useIntegrationDetail } from '@/integrations/hooks/useIntegrationDetail';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { lazy, Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useIntegrationEdit } from '@/integrations/hooks/useIntegrationEdit';
import { FACEBOOK_INTEGRATION_SCHEMA } from '@/integrations/facebook/constants/FbMessengerSchema';
import { IntegrationType } from '@/types/Integration';
import { useSearchParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import {
  selectedFacebookAccountAtom,
  activeFacebookFormStepAtom,
} from '@/integrations/facebook/states/facebookStates';

const FacebookIntegrationBotSection = lazy(() =>
  import(
    '~/widgets/automations/modules/facebook/components/bots/components/FacebookIntegrationBotSection'
  ).then((module) => ({ default: module.FacebookIntegrationBotSection })),
);

export const FacebookIntegrationDetail = ({ isPost }: { isPost?: boolean }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setDraft = useSetAtom(sidePanelDraftState);
  const setSelectedAccount = useSetAtom(selectedFacebookAccountAtom);
  const setActiveStep = useSetAtom(activeFacebookFormStepAtom);

  useEffect(() => {
    const fbAuthorized = searchParams.get('fbAuthorized');
    const accountId = searchParams.get('accountId');

    if (fbAuthorized === 'true') {
      setDraft(null);
      if (accountId) {
        setSelectedAccount(accountId);
        setActiveStep(2);
      }

      searchParams.delete('fbAuthorized');
      searchParams.delete('accountId');
      searchParams.set(
        'panel',
        getSidePanelRecordPath({
          contentType: INTEGRATION_CONTENT_TYPE,
          contentId: 'new',
        }),
      );
      setSearchParams(searchParams, { replace: true });
    }
  }, [
    searchParams,
    setSearchParams,
    setDraft,
    setSelectedAccount,
    setActiveStep,
  ]);

  return (
    <div>
      <FacebookIntegrationFormSheet isPost={isPost} />
    </div>
  );
};

export const FacebookIntegrationActions = ({
  integration,
}: {
  integration: IIntegration;
}) => {
  return <FacebookIntegrationEditSheet id={integration._id} />;
};

export const FacebookIntegrationEditSheet = ({ id }: { id: string }) => (
  <IntegrationEditButton integration={{ _id: id }} />
);

export const FacebookIntegrationEditForm = ({
  id,
  setOpen,
}: {
  id: string;
  setOpen: (open: boolean) => void;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const { loading, integrationDetail } = useIntegrationDetail({
    integrationId: id,
  });

  const { editIntegration, loading: editLoading } = useIntegrationEdit();
  const form = useForm<z.infer<typeof FACEBOOK_INTEGRATION_SCHEMA>>({
    resolver: zodResolver(FACEBOOK_INTEGRATION_SCHEMA),
  });

  useEffect(() => {
    if (integrationDetail) {
      form.reset({
        name: integrationDetail.name,
        brandId: integrationDetail.brandId ?? '',
      });
    }
  }, [integrationDetail, form]);

  const onSubmit = (data: z.infer<typeof FACEBOOK_INTEGRATION_SCHEMA>) => {
    editIntegration({
      variables: {
        _id: id,
        name: data.name,
        channelId: integrationDetail?.channelId || '',
        brandId: data.brandId,
      },
      onCompleted: () => {
        setOpen(false);
        toast({ title: t('integration-updated') });
      },
      onError: (error) => {
        toast({ title: error.message, variant: 'destructive' });
      },
    });
  };

  if (loading) return <Spinner className="p-20" />;

  return (
    <>
      <Form {...form}>
        <form
          className="flex flex-1 min-h-0 flex-col"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
            <div>
              <Label htmlFor="pageName">{t('page-name')}</Label>
              <Input
                id="pageName"
                value={integrationDetail?.facebookPage?.[0]?.name ?? undefined}
                className="mt-2"
                readOnly
              />
            </div>
            <Form.Field
              name="name"
              render={({ field }) => (
                <IntegrationFormItem label={t('name')}>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.Message />
                </IntegrationFormItem>
              )}
            />
            <Form.Field
              name="brandId"
              render={({ field }) => (
                <IntegrationFormItem label={t('brand')}>
                  <SelectBrands.FormItem
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                  <Form.Message />
                </IntegrationFormItem>
              )}
            />
          </div>
          <Separator />
          <div className="flex shrink-0 justify-end gap-1 p-2">
            <Button
              type="button"
              onClick={() => setOpen(false)}
              disabled={loading || editLoading}
              variant="ghost"
            >
              {t('close')}
            </Button>
            <Button type="submit" disabled={loading || editLoading}>
              {t('save')}
            </Button>
          </div>
        </form>
      </Form>
      {integrationDetail?.kind === IntegrationType.FACEBOOK_MESSENGER && (
        <>
          <Separator />
          <div className="max-h-[40%] overflow-y-auto px-3 py-3">
            <Suspense fallback={<Spinner />}>
              <FacebookIntegrationBotSection integrationId={id} />
            </Suspense>
          </div>
        </>
      )}
    </>
  );
};
