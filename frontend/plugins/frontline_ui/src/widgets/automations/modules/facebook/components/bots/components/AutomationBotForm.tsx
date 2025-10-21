import { zodResolver } from '@hookform/resolvers/zod';
import { Sheet, Spinner } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AutomationBotFormEffect } from '~/widgets/automations/modules/facebook/components/bots/components/AutomationBotFormEffect';
import { AutomationFbBotFormContent } from '~/widgets/automations/modules/facebook/components/bots/components/AutomationFbBotFormContent';
import { useFacebookBotForm } from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookBotForm';
import {
  facebookBotFormSchema,
  TFacebookBotForm,
} from '~/widgets/automations/modules/facebook/components/bots/states/facebookBotForm';

export const AutomationBotForm = ({
  facebookBotId,
}: {
  facebookBotId: string | null;
}) => {
  const { loadingDetail, formDefaultValues } =
    useFacebookBotForm(facebookBotId);

  const form = useForm<TFacebookBotForm>({
    resolver: zodResolver(facebookBotFormSchema),
    defaultValues: formDefaultValues,
  });

  if (loadingDetail) {
    return <Spinner />;
  }
  return (
    <>
      <Sheet.Header>
        <Sheet.Title className="capitalize">
          {facebookBotId ? 'Edit' : 'Add new'} facebook bot
        </Sheet.Title>
        <Sheet.Close />
      </Sheet.Header>
      <AutomationBotFormEffect
        form={form}
        formDefaultValues={formDefaultValues}
      />
      <AutomationFbBotFormContent form={form} />
    </>
  );
};
