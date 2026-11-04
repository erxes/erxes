import { FACEBOOK_INTEGRATION_SCHEMA } from '@/integrations/facebook/constants/FbMessengerSchema';
import { useFbIntegrationContext } from '@/integrations/facebook/contexts/FbIntegrationContext';
import { useIntegrationAdd } from '@/integrations/hooks/useIntegrationAdd';
import { IntegrationType } from '@/types/Integration';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Spinner } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { SelectBrands } from 'ui-modules';
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

export const FacebookIntegrationSetup = () => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const { id: channelId } = useParams();
  const { isPost } = useFbIntegrationContext();
  const form = useForm<z.infer<typeof FACEBOOK_INTEGRATION_SCHEMA>>({
    resolver: zodResolver(FACEBOOK_INTEGRATION_SCHEMA),
    defaultValues: {
      name: '',
      brandId: '',
    },
  });

  const accountId = useAtomValue(selectedFacebookAccountAtom);
  const pageId = useAtomValue(selectedFacebookPageAtom);

  const { addIntegration, loading } = useIntegrationAdd();

  const resetFacebookForm = useSetAtom(resetFacebookAddStateAtom);
  const setActiveStep = useSetAtom(activeFacebookFormStepAtom);

  const onNext = (data: z.infer<typeof FACEBOOK_INTEGRATION_SCHEMA>) => {
    // Stays open until the server answers, so the wait shows on the button and
    // a failure keeps what was typed.
    addIntegration({
      variables: {
        kind: isPost
          ? IntegrationType.FACEBOOK_POST
          : IntegrationType.FACEBOOK_MESSENGER,
        name: data.name,
        accountId,
        channelId: channelId as string,
        brandId: data.brandId,
        data: {
          pageIds: [pageId],
        },
      },
      refetchQueries: ['Integrations', 'FacebookGetIntegrations'],
      awaitRefetchQueries: true,
    }).then(({ errors }) => {
      if (!errors?.length) {
        resetFacebookForm();
      }
    });
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col flex-1"
        onSubmit={form.handleSubmit(onNext)}
      >
        <FacebookIntegrationFormLayout
          actions={
            <>
              <Button
                variant="secondary"
                className="bg-border"
                disabled={loading}
                onClick={() => setActiveStep(2)}
              >
                {t('previous-step')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Spinner size="sm" />}
                {t('save')}
              </Button>
            </>
          }
        >
          <FacebookIntegrationFormSteps
            title={t('integration-setup')}
            step={3}
          />
          <div className="flex-1 overflow-hidden p-4 pt-0 flex flex-col gap-4">
            <Form.Field
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('integration-name')}</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.Description>
                    {t('integration-name-description')}
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              name="brandId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('brand')}</Form.Label>
                  <Form.Control>
                    <SelectBrands.FormItem
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </Form.Control>
                  <Form.Description>
                    {t('choose-brand-description')}
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
        </FacebookIntegrationFormLayout>
      </form>
    </Form>
  );
};
