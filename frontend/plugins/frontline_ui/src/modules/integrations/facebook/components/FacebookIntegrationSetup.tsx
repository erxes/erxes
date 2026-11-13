import { createIntegrationFormDraft } from '@/integrations/hooks/useIntegrationDraft';
import { Button, Form, Spinner } from 'erxes-ui';
import { useSidePanel } from 'ui-modules';

import { useIntegrationChannelId } from '@/integrations/components/IntegrationPanelForm';
import {
  IntegrationNameField,
  IntegrationBrandField,
} from '@/integrations/components/IntegrationFormFields';
import { FACEBOOK_INTEGRATION_SCHEMA } from '@/integrations/facebook/constants/FbMessengerSchema';
import { useFbIntegrationContext } from '@/integrations/facebook/contexts/FbIntegrationContext';
import { useSocialIntegrationCreate } from '@/integrations/hooks/useSocialIntegrationCreate';
import { useEffect } from 'react';
import { IntegrationType } from '@/types/Integration';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAtomValue, useSetAtom } from 'jotai';
import { useForm } from 'react-hook-form';

import { useTranslation } from 'react-i18next';

import type { z } from 'zod';
import {
  activeFacebookFormStepAtom,
  resetFacebookAddStateAtom,
  selectedFacebookAccountAtom,
  selectedFacebookPageAtom,
} from '@/integrations/facebook/states/facebookStates';
import {
  FacebookIntegrationFormLayout,
  FacebookIntegrationFormSteps,
} from '@/integrations/facebook/components/FacebookIntegrationForm';

const useFormDraft =
  createIntegrationFormDraft<z.infer<typeof FACEBOOK_INTEGRATION_SCHEMA>>();

export const FacebookIntegrationSetup = () => {
  const { close } = useSidePanel();
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const channelId = useIntegrationChannelId();
  const { isPost } = useFbIntegrationContext();
  const form = useForm<z.infer<typeof FACEBOOK_INTEGRATION_SCHEMA>>({
    resolver: zodResolver(FACEBOOK_INTEGRATION_SCHEMA),
    defaultValues: {
      name: '',
      brandId: '',
    },
  });
  const { clearDraft, isActive } = useFormDraft(form);

  const accountId = useAtomValue(selectedFacebookAccountAtom);
  const pageId = useAtomValue(selectedFacebookPageAtom);

  const { createIntegration, createdId, loading } =
    useSocialIntegrationCreate();

  const resetFacebookForm = useSetAtom(resetFacebookAddStateAtom);
  const setActiveStep = useSetAtom(activeFacebookFormStepAtom);

  useEffect(() => {
    if (!createdId || !isActive()) return;
    clearDraft();
    resetFacebookForm();
    close();
  }, [createdId, isActive, clearDraft, resetFacebookForm, close]);

  const onNext = (data: z.infer<typeof FACEBOOK_INTEGRATION_SCHEMA>) =>
    createIntegration({
      variables: {
        kind: isPost
          ? IntegrationType.FACEBOOK_POST
          : IntegrationType.FACEBOOK_MESSENGER,
        name: data.name,
        accountId,
        channelId: channelId || '',
        brandId: data.brandId,
        data: {
          pageIds: [pageId],
        },
      },
      refetchQueries: ['Integrations', 'FacebookGetIntegrations'],
      awaitRefetchQueries: true,
    });

  const setupFields = (
    <div className="flex-1 overflow-hidden p-4 pt-0 flex flex-col gap-4">
      <IntegrationNameField
        label={t('integration-name')}
        description={t('integration-name-description')}
      />

      <IntegrationBrandField
        outerRow
        variant="form-item"
        description={t('choose-brand-description')}
      />
    </div>
  );
  const actions = (
    <>
      <Button
        variant="secondary"
        className="bg-border"
        disabled={loading || Boolean(createdId)}
        onClick={() => setActiveStep(2)}
      >
        {t('previous-step')}
      </Button>
      <Button type="submit" disabled={loading || Boolean(createdId)}>
        {loading && <Spinner size="sm" />}
        {t('save')}
      </Button>
    </>
  );

  return (
    <Form {...form}>
      <form
        className="flex flex-col flex-1"
        onSubmit={form.handleSubmit(onNext)}
      >
        <FacebookIntegrationFormLayout actions={actions}>
          <FacebookIntegrationFormSteps
            title={t('integration-setup')}
            step={3}
          />
          {setupFields}
        </FacebookIntegrationFormLayout>
      </form>
    </Form>
  );
};
