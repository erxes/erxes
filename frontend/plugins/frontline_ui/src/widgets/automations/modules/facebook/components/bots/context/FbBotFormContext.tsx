import { IFacebookBot } from '@/integrations/facebook/types/FacebookBot';
import {
  facebookBotFormSchema,
  TFacebookBotForm,
} from '~/widgets/automations/modules/facebook/components/bots/states/facebookBotForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { createContext, ReactNode, useContext, useMemo } from 'react';
import { DefaultValues, useForm, UseFormReturn } from 'react-hook-form';
import { generateAutomationElementId } from 'ui-modules';

interface FbBotFormContextType {
  form: UseFormReturn<TFacebookBotForm>;
  facebookMessengerBot?: TFacebookBotForm;
}

const FbBotFormContext = createContext<FbBotFormContextType | null>(null);

export const FbBotFormProvider = ({
  children,
  facebookMessengerBot,
}: {
  children: ReactNode;
  facebookMessengerBot?: IFacebookBot;
}) => {
  const defaultValues = useMemo<DefaultValues<TFacebookBotForm>>(
    () => ({
      name: facebookMessengerBot?.name ?? '',
      persistentMenus: facebookMessengerBot?.persistentMenus?.length
        ? facebookMessengerBot.persistentMenus.map(
            ({ _id, text, type, link }) => ({
              _id: _id ?? generateAutomationElementId(),
              text: text ?? '',
              type: (type ?? 'button') as 'button' | 'link',
              link: link ?? '',
            }),
          )
        : [
            {
              _id: generateAutomationElementId(),
              text: 'Get Started',
              type: 'button',
              link: '',
            },
          ],
      tag: facebookMessengerBot?.tag ?? 'CONFIRMED_EVENT_UPDATE',
      greetText: facebookMessengerBot?.greetText ?? '',
      isEnabledBackBtn: facebookMessengerBot?.isEnabledBackBtn ?? false,
      backButtonText: facebookMessengerBot?.backButtonText ?? '',
      accountId: facebookMessengerBot?.accountId ?? '',
      pageId: facebookMessengerBot?.pageId ?? '',
    }),
    [facebookMessengerBot],
  );

  console.log({ defaultValues });
  const form = useForm<TFacebookBotForm>({
    resolver: zodResolver(facebookBotFormSchema),
    defaultValues,
  });
  return (
    <FbBotFormContext.Provider value={{ form, facebookMessengerBot }}>
      {children}
    </FbBotFormContext.Provider>
  );
};

export default FbBotFormContext;

export const useFbBotFormContext = () => {
  const context = useContext(FbBotFormContext);
  if (!context) {
    throw new Error(
      'useFbBotFormContext must be used within a FbBotFormProvider',
    );
  }
  return context;
};
