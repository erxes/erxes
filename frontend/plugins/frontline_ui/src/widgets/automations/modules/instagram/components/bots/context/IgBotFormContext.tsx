import { IInstagramBot } from '@/integrations/instagram/types/InstagramBot';
import {
  instagramBotFormSchema,
  TInstagramBotForm,
} from '~/widgets/automations/modules/instagram/components/bots/states/instagramBotForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { createContext, ReactNode, useContext, useMemo } from 'react';
import { DefaultValues, useForm, UseFormReturn } from 'react-hook-form';
import { generateAutomationElementId } from 'ui-modules';

interface IgBotFormContextType {
  form: UseFormReturn<TInstagramBotForm>;
  instagramMessengerBot?: TInstagramBotForm;
}

const IgBotFormContext = createContext<IgBotFormContextType | null>(null);

export const IgBotFormProvider = ({
  children,
  instagramMessengerBot,
}: {
  children: ReactNode;
  instagramMessengerBot?: IInstagramBot;
}) => {
  const defaultValues = useMemo<DefaultValues<TInstagramBotForm>>(
    () => ({
      name: instagramMessengerBot?.name || '',
      persistentMenus: instagramMessengerBot?.persistentMenus?.length
        ? instagramMessengerBot.persistentMenus.map(
            ({ _id, text, type, link }) => ({
              _id: _id || generateAutomationElementId(),
              text: text || '',
              type: (type || 'button') as 'button' | 'link',
              link: link || '',
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
      tag: instagramMessengerBot?.tag || 'CONFIRMED_EVENT_UPDATE',
      greetText: instagramMessengerBot?.greetText || '',
      isEnabledBackBtn: instagramMessengerBot?.isEnabledBackBtn || false,
      backButtonText: instagramMessengerBot?.backButtonText || '',
      accountId: instagramMessengerBot?.accountId || '',
      pageId: instagramMessengerBot?.pageId || '',
    }),
    [instagramMessengerBot],
  );

  const form = useForm<TInstagramBotForm>({
    resolver: zodResolver(instagramBotFormSchema),
    defaultValues,
  });
  return (
    <IgBotFormContext.Provider value={{ form, instagramMessengerBot }}>
      {children}
    </IgBotFormContext.Provider>
  );
};

export default IgBotFormContext;

export const useIgBotFormContext = () => {
  const context = useContext(IgBotFormContext);
  if (!context) {
    throw new Error(
      'useIgBotFormContext must be used within a IgBotFormProvider',
    );
  }
  return context;
};
