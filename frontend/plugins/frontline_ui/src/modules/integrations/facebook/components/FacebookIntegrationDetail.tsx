import { createIntegrationFormDraft } from '@/integrations/hooks/useIntegrationDraft';
import {
  PanelFormLayout,
  getSidePanelRecordPath,
  sidePanelDraftState,
} from 'ui-modules';
import {
  INTEGRATION_CONTENT_TYPE,
  IntegrationEditButton,
} from '@/integrations/components/IntegrationPanelForm';
import {
  IntegrationNameField,
  IntegrationBrandField,
} from '@/integrations/components/IntegrationFormFields';

import { FacebookIntegrationFormSheet } from './FacebookIntegrationForm';
import { IIntegration } from '@/integrations/types/Integration';
import { Separator, Spinner, Form, Input, toast, Label } from 'erxes-ui';

import { useIntegrationDetail } from '@/integrations/hooks/useIntegrationDetail';
import { z } from 'zod';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { lazy, Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useIntegrationEdit } from '@/integrations/hooks/useIntegrationEdit';
import { FACEBOOK_INTEGRATION_SCHEMA } from '@/integrations/facebook/constants/FbMessengerSchema';
import { IntegrationType } from '@/types/Integration';
import { useSearchParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { authorizedFacebookAccountAtom } from '@/integrations/facebook/states/facebookStates';

const FacebookIntegrationBotSection = lazy(() =>
  import(
    '~/widgets/automations/modules/facebook/components/bots/components/FacebookIntegrationBotSection'
  ).then((module) => ({ default: module.FacebookIntegrationBotSection })),
);

const useFormDraft =
  createIntegrationFormDraft<z.infer<typeof FACEBOOK_INTEGRATION_SCHEMA>>();

/** Resumes Facebook authorization in the integration record panel. */
export const FacebookIntegrationDetail = ({ isPost }: { isPost?: boolean }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setDraft = useSetAtom(sidePanelDraftState);
  const setAuthorizedAccount = useSetAtom(authorizedFacebookAccountAtom);

  useEffect(() => {
    const fbAuthorized = searchParams.get('fbAuthorized');
    const accountId = searchParams.get('accountId');

    if (fbAuthorized === 'true') {
      setDraft(null);
      if (accountId) {
        setAuthorizedAccount(accountId);
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
  }, [searchParams, setSearchParams, setDraft, setAuthorizedAccount]);

  return (
    <div>
      <FacebookIntegrationFormSheet isPost={isPost} />
    </div>
  );
};

/** Opens the selected Facebook integration record. */
export const FacebookIntegrationEditSheet = ({ id }: { id: string }) => (
  <IntegrationEditButton integration={{ _id: id }} />
);

/** Renders the edit action for a Facebook integration. */
export const FacebookIntegrationActions = ({
  integration,
}: {
  integration: IIntegration;
}) => {
  return <FacebookIntegrationEditSheet id={integration._id} />;
};

/** Renders the Facebook page identity and editable integration fields. */
const FacebookIntegrationEditFields = ({
  pageName,
  form,
}: {
  pageName?: string;
  form: UseFormReturn<z.infer<typeof FACEBOOK_INTEGRATION_SCHEMA>>;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
      <div>
        <Label htmlFor="pageName">{t('page-name')}</Label>
        <Input id="pageName" value={pageName} className="mt-2" readOnly />
      </div>
      <IntegrationNameField
        registration={form.register('name')}
        error={form.formState.errors.name?.message}
      />
      <IntegrationBrandField outerRow variant="form-item" />
    </div>
  );
};

/** Loads the bot configuration attached to a Facebook integration. */
const FacebookIntegrationBotArea = ({
  integrationId,
}: {
  integrationId: string;
}) => (
  <>
    <Separator />
    <div className="max-h-[40%] overflow-y-auto px-3 py-3">
      <Suspense fallback={<Spinner />}>
        <FacebookIntegrationBotSection integrationId={integrationId} />
      </Suspense>
    </div>
  </>
);

/** Edits Facebook integration details and its Messenger bot settings. */
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

  const { markSaved, isActive, getSaveValues } = useFormDraft(form, {
    name: integrationDetail?.name ?? '',
    brandId: integrationDetail?.brandId ?? '',
  });

  /** Saves Facebook integration fields and closes the panel after success. */
  const onSubmit = (data: z.infer<typeof FACEBOOK_INTEGRATION_SCHEMA>) => {
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

  const editForm = (
    <Form {...form}>
      <form
        className="flex flex-1 min-h-0 flex-col"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <PanelFormLayout
          onCancel={() => setOpen(false)}
          saving={loading || editLoading}
        >
          <FacebookIntegrationEditFields
            form={form}
            pageName={integrationDetail?.facebookPage?.[0]?.name ?? undefined}
          />
        </PanelFormLayout>
      </form>
    </Form>
  );

  return (
    <>
      {editForm}
      {integrationDetail?.kind === IntegrationType.FACEBOOK_MESSENGER && (
        <FacebookIntegrationBotArea integrationId={id} />
      )}
    </>
  );
};
