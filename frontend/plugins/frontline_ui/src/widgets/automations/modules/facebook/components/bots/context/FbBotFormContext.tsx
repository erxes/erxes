import { IFacebookBot } from '@/integrations/facebook/types/FacebookBot';
import { zodResolver } from '@hookform/resolvers/zod';
import { createContext, useContext } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { generateAutomationElementId } from 'ui-modules';
import {
  facebookBotFormSchema,
  TFacebookBotForm,
} from '../states/facebookBotForm';

interface FbBotFormContextType {
  form: UseFormReturn<TFacebookBotForm>;
  facebookMessengerBot?: TFacebookBotForm;
}

const FbBotFormContext = createContext<FbBotFormContextType | null>(null);

export const FbBotFormProvider = ({
  children,
  facebookMessengerBot,
}: {
  children: React.ReactNode;
  facebookMessengerBot?: IFacebookBot;
}) => {
  const form = useForm<TFacebookBotForm>({
    resolver: zodResolver(facebookBotFormSchema),
    defaultValues: {
      name: facebookMessengerBot?.name || '',
      persistentMenus: facebookMessengerBot?.persistentMenus || [
        {
          _id: generateAutomationElementId(),
          text: 'Get Started',
          type: 'button',
        },
      ],
      tag: facebookMessengerBot?.tag || 'CONFIRMED_EVENT_UPDATE',
      greetText: facebookMessengerBot?.greetText,
      isEnabledBackBtn: facebookMessengerBot?.isEnabledBackBtn,
      backButtonText: facebookMessengerBot?.backButtonText,
      accountId: facebookMessengerBot?.accountId || '',
      pageId: facebookMessengerBot?.pageId || '',
    },
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
