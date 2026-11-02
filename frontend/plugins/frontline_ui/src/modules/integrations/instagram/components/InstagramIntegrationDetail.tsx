import {
  IntegrationFormItem,
  INTEGRATION_CONTENT_TYPE,
  IntegrationEditButton,
} from '@/integrations/components/IntegrationPanelForm';
import { isRecord } from '@/shared/utils/isRecord';

import {
  getSidePanelRecordPath,
  sidePanelDraftState,
  SelectBrand,
} from 'ui-modules';
import { InstagramIntegrationFormSheet } from './InstagramIntegrationForm';
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
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useIntegrationEdit } from '@/integrations/hooks/useIntegrationEdit';
import { INSTAGRAM_INTEGRATION_SCHEMA } from '../constants/IgMessengerSchema';
import { useSearchParams } from 'react-router-dom';

import { useSetAtom } from 'jotai';
import {
  selectedInstagramAccountAtom,
  activeInstagramFormStepAtom,
} from '../states/instagramStates';

export const InstagramIntegrationDetail = ({
  isPost,
}: {
  isPost?: boolean;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setDraft = useSetAtom(sidePanelDraftState);
  const setSelectedAccount = useSetAtom(selectedInstagramAccountAtom);
  const setActiveStep = useSetAtom(activeInstagramFormStepAtom);

  useEffect(() => {
    const igAuthorized = searchParams.get('igAuthorized');
    const accountId = searchParams.get('accountId');

    if (igAuthorized === 'true') {
      setDraft(null);
      if (accountId) {
        setSelectedAccount(accountId);
        setActiveStep(2);
      }

      searchParams.delete('igAuthorized');
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
      <InstagramIntegrationFormSheet isPost={isPost} />
    </div>
  );
};

export const InstagramIntegrationActions = ({
  integration,
}: {
  integration: IIntegration;
}) => {
  return <InstagramIntegrationEditSheet id={integration._id} />;
};

export const InstagramIntegrationEditSheet = ({ id }: { id: string }) => (
  <IntegrationEditButton integration={{ _id: id }} />
);

export const InstagramIntegrationEditForm = ({
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
  const form = useForm<z.infer<typeof INSTAGRAM_INTEGRATION_SCHEMA>>({
    resolver: zodResolver(INSTAGRAM_INTEGRATION_SCHEMA),
  });

  useEffect(() => {
    if (integrationDetail) {
      form.reset({
        name: integrationDetail.name,
        brandId: integrationDetail.brandId ?? '',
      });
    }
  }, [integrationDetail, form]);

  const onSubmit = (data: z.infer<typeof INSTAGRAM_INTEGRATION_SCHEMA>) => {
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
              value={
                Array.isArray(integrationDetail?.instagramPage) &&
                isRecord(integrationDetail.instagramPage[0]) &&
                typeof integrationDetail.instagramPage[0].name === 'string'
                  ? integrationDetail.instagramPage[0].name
                  : ''
              }
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
              </IntegrationFormItem>
            )}
          />
          <Form.Field
            name="brandId"
            render={({ field }) => (
              <IntegrationFormItem label={t('brand')}>
                <SelectBrand
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder={t('select-a-brand')}
                  className="w-full h-10 rounded-lg border bg-background"
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
  );
};
