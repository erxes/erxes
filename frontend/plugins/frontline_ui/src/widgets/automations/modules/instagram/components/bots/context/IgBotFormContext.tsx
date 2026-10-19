import { IInstagramBotDetail } from '@/integrations/instagram/types/InstagramBot';
import {
  instagramBotFormSchema,
  TInstagramBotForm,
} from '~/widgets/automations/modules/instagram/components/bots/states/instagramBotForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { createContext, ReactNode, useContext, useMemo } from 'react';
import { DefaultValues, useForm, UseFormReturn } from 'react-hook-form';
import { isDefined } from 'erxes-ui';
import { generateAutomationElementId } from 'ui-modules';

interface IgBotFormContextType {
  form: UseFormReturn<TInstagramBotForm>;
  instagramMessengerBot?: IInstagramBotDetail;
}

const menuTypeSchema =
  instagramBotFormSchema.shape.persistentMenus.element.shape.type;

const toMenuType = (type?: string | null) => {
  const parsed = menuTypeSchema.safeParse(type);

  return parsed.success ? parsed.data : 'button';
};

const toBotTag = (tag?: string | null) => {
  const parsed = instagramBotFormSchema.shape.tag.safeParse(tag);

  return parsed.success ? parsed.data : 'CONFIRMED_EVENT_UPDATE';
};

const IgBotFormContext = createContext<IgBotFormContextType | null>(null);

export const IgBotFormProvider = ({
  children,
  instagramMessengerBot,
}: {
  children: ReactNode;
  instagramMessengerBot?: IInstagramBotDetail;
}) => {
  const defaultValues = useMemo<DefaultValues<TInstagramBotForm>>(
    () => ({
      name: instagramMessengerBot?.name || '',
      persistentMenus: instagramMessengerBot?.persistentMenus?.length
        ? instagramMessengerBot.persistentMenus
            .filter(isDefined)
            .map(({ _id, text, type, link }) => ({
              _id: _id || generateAutomationElementId(),
              text: text || '',
              type: toMenuType(type),
              link: link || '',
            }))
        : [
            {
              _id: generateAutomationElementId(),
              text: 'Get Started',
              type: 'button',
              link: '',
            },
          ],
      tag: toBotTag(instagramMessengerBot?.tag),
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
