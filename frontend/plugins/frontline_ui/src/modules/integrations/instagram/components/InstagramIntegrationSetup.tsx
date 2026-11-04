import { createIntegrationFormDraft } from '@/integrations/hooks/useIntegrationDraft';
import { Button, Form } from 'erxes-ui';
import { PanelFormRow, useSidePanel, SelectBrand } from 'ui-modules';

import { useIntegrationChannelId } from '@/integrations/components/IntegrationPanelForm';
import { IntegrationNameField } from '@/integrations/components/IntegrationFormFields';

import { useTranslation } from 'react-i18next';

import {
  InstagramIntegrationFormSteps,
  InstagramIntegrationFormLayout,
} from './InstagramIntegrationForm';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  activeInstagramFormStepAtom,
  resetInstagramAddStateAtom,
  selectedInstagramAccountAtom,
  selectedInstagramPageAtom,
} from '@/integrations/instagram/states/instagramStates';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { INSTAGRAM_INTEGRATION_SCHEMA } from '@/integrations/instagram/constants/IgMessengerSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSocialIntegrationCreate } from '@/integrations/hooks/useSocialIntegrationCreate';
import { useEffect } from 'react';
import { useIgIntegrationContext } from '@/integrations/instagram/context/IgIntegrationContext';

const INTEGRATION_KINDS = {
  POST: 'instagram-post',
  MESSENGER: 'instagram-messenger',
};

const useFormDraft =
  createIntegrationFormDraft<z.infer<typeof INSTAGRAM_INTEGRATION_SCHEMA>>();

export const InstagramIntegrationSetup = () => {
  const { close } = useSidePanel();
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const channelId = useIntegrationChannelId();
  const { isPost } = useIgIntegrationContext();
  const form = useForm<z.infer<typeof INSTAGRAM_INTEGRATION_SCHEMA>>({
    resolver: zodResolver(INSTAGRAM_INTEGRATION_SCHEMA),
    defaultValues: { name: '', brandId: '' },
  });
  const { clearDraft, isActive } = useFormDraft(form);

  const accountId = useAtomValue(selectedInstagramAccountAtom);
  const pageId = useAtomValue(selectedInstagramPageAtom);

  const { createIntegration, createdId, loading } =
    useSocialIntegrationCreate();
  const resetInstagramForm = useSetAtom(resetInstagramAddStateAtom);
  const setActiveStep = useSetAtom(activeInstagramFormStepAtom);

  useEffect(() => {
    if (!createdId || !isActive()) return;
    clearDraft();
    resetInstagramForm();
    close();
  }, [createdId, isActive, clearDraft, resetInstagramForm, close]);

  /** Creates once per scoped context and leaves failed inputs available for retry. */
  const onNext = (data: z.infer<typeof INSTAGRAM_INTEGRATION_SCHEMA>) => {
    if (!channelId) return undefined;
    return createIntegration({
      variables: {
        kind: isPost ? INTEGRATION_KINDS.POST : INTEGRATION_KINDS.MESSENGER,
        name: data.name,
        accountId,
        channelId,
        brandId: data.brandId,
        data: { pageIds: [pageId] },
      },
      refetchQueries: ['Integrations'],
    });
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col flex-1"
        onSubmit={form.handleSubmit(onNext)}
      >
        <InstagramIntegrationFormLayout
          actions={
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
                {t('save')}
              </Button>
            </>
          }
        >
          <InstagramIntegrationFormSteps
            title={t('integration-setup')}
            step={3}
          />
          <div className="flex-1 overflow-hidden p-4 pt-0 flex flex-col gap-4">
            <IntegrationNameField
              label={t('integration-name')}
              description={t('integration-name-description')}
            />

            <Form.Field
              name="brandId"
              render={({ field }) => (
                <Form.Item>
                  <PanelFormRow label={t('brand')}>
                    <Form.Control>
                      <SelectBrand
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder={t('select-a-brand')}
                        className="w-full h-10 rounded-lg border bg-background"
                      />
                    </Form.Control>
                    <Form.Description>
                      {t('choose-brand-description')}
                    </Form.Description>
                    <Form.Message />
                  </PanelFormRow>
                </Form.Item>
              )}
            />
          </div>
        </InstagramIntegrationFormLayout>
      </form>
    </Form>
  );
};
