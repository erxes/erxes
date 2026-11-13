import { useEffect } from 'react';
import { createIntegrationFormDraft } from '@/integrations/hooks/useIntegrationDraft';
import {
  PanelFormRow,
  PanelFormLayout,
  getSidePanelRecordPath,
  sidePanelDraftState,
  SelectBrand,
} from 'ui-modules';
import {
  INTEGRATION_CONTENT_TYPE,
  IntegrationEditButton,
} from '@/integrations/components/IntegrationPanelForm';
import { IntegrationNameField } from '@/integrations/components/IntegrationFormFields';
import { isRecord } from '@/shared/utils/isRecord';

import { InstagramIntegrationFormSheet } from './InstagramIntegrationForm';
import { IIntegration } from '@/integrations/types/Integration';
import { Spinner, Form, Input, toast, Label } from 'erxes-ui';
import { useIntegrationDetail } from '@/integrations/hooks/useIntegrationDetail';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useIntegrationEdit } from '@/integrations/hooks/useIntegrationEdit';
import { INSTAGRAM_INTEGRATION_SCHEMA } from '../constants/IgMessengerSchema';
import { useSearchParams } from 'react-router-dom';

import { useSetAtom } from 'jotai';
import { authorizedInstagramAccountAtom } from '../states/instagramStates';

const useFormDraft =
  createIntegrationFormDraft<z.infer<typeof INSTAGRAM_INTEGRATION_SCHEMA>>();

/** Resumes Instagram authorization in the integration record panel. */
export const InstagramIntegrationDetail = ({
  isPost,
}: {
  isPost?: boolean;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setDraft = useSetAtom(sidePanelDraftState);
  const setAuthorizedAccount = useSetAtom(authorizedInstagramAccountAtom);

  useEffect(() => {
    const igAuthorized = searchParams.get('igAuthorized');
    const accountId = searchParams.get('accountId');

    if (igAuthorized === 'true') {
      setDraft(null);
      if (accountId) {
        setAuthorizedAccount(accountId);
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
  }, [searchParams, setSearchParams, setDraft, setAuthorizedAccount]);

  return (
    <div>
      <InstagramIntegrationFormSheet isPost={isPost} />
    </div>
  );
};

/** Opens the selected Instagram integration record for editing. */
export const InstagramIntegrationEditSheet = ({ id }: { id: string }) => (
  <IntegrationEditButton integration={{ _id: id }} />
);

/** Renders the edit action for an Instagram integration. */
export const InstagramIntegrationActions = ({
  integration,
}: {
  integration: IIntegration;
}) => {
  return <InstagramIntegrationEditSheet id={integration._id} />;
};

/** Reads the first Instagram page name from the provider response. */
const getInstagramPageName = (pages: unknown): string =>
  Array.isArray(pages) &&
  isRecord(pages[0]) &&
  typeof pages[0].name === 'string'
    ? pages[0].name
    : '';

/** Renders the connected Instagram page and editable name and brand fields. */
const InstagramIntegrationEditFields = ({ pageName }: { pageName: string }) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
      <div>
        <Label htmlFor="pageName">{t('page-name')}</Label>
        <Input id="pageName" value={pageName} className="mt-2" readOnly />
      </div>
      <IntegrationNameField showMessage={false} />
      <Form.Field
        name="brandId"
        render={({ field }) => (
          <Form.Item>
            <PanelFormRow label={t('brand')}>
              <SelectBrand
                value={field.value}
                onValueChange={field.onChange}
                placeholder={t('select-a-brand')}
                className="w-full h-10 rounded-lg border bg-background"
              />
              <Form.Message />
            </PanelFormRow>
          </Form.Item>
        )}
      />
    </div>
  );
};

/** Loads and edits the selected Instagram integration's name and brand. */
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

  const { markSaved, isActive, getSaveValues } = useFormDraft(form, {
    name: integrationDetail?.name ?? '',
    brandId: integrationDetail?.brandId ?? '',
  });

  /** Saves Instagram integration fields and closes the panel after success. */
  const onSubmit = (data: z.infer<typeof INSTAGRAM_INTEGRATION_SCHEMA>) => {
    const submittedValues = data;
    const savedValues = getSaveValues(data);
    editIntegration({
      variables: {
        _id: id,
        name: savedValues.name,
        channelId: integrationDetail?.channelId || '',
        brandId: savedValues.brandId,
      },
      onCompleted: () => {
        if (markSaved(savedValues, submittedValues) && isActive())
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
        <PanelFormLayout
          onCancel={() => setOpen(false)}
          saving={loading || editLoading}
        >
          <InstagramIntegrationEditFields
            pageName={getInstagramPageName(integrationDetail?.instagramPage)}
          />
        </PanelFormLayout>
      </form>
    </Form>
  );
};
