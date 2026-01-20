import {
    selectedInstagramAccountAtom,
    selectedInstagramPageAtom,
  } from '@/integrations/instagram/states/instagramStates';
  import { useAtom } from 'jotai';
  import { useEffect } from 'react';
  import { useFormContext } from 'react-hook-form';
  import { TInstagramBotForm } from '~/widgets/automations/modules/instagram/components/bots/states/instagramBotForm';
  import { useIgBotFormContext } from '../context/IgBotFormContext';
  
  type Props = {
    formDefaultValues?: any;
  };
  
  export const AutomationBotFormEffect = () => {
    const { instagramMessengerBot, form } = useIgBotFormContext();
    const { setValue } = form;
    const [atomAccountId, setAtomAccountId] = useAtom(
      selectedInstagramAccountAtom,
    );
    const [atomPageId, setAtomPageId] = useAtom(selectedInstagramPageAtom);
  
    useEffect(() => {
      if (atomAccountId) {
        setValue('accountId', atomAccountId);
      }
      if (atomPageId) {
        setValue('pageId', atomPageId);
      }
      if (instagramMessengerBot?.accountId && !atomAccountId) {
        setAtomAccountId(instagramMessengerBot.accountId);
      }
      if (instagramMessengerBot?.pageId && !atomPageId) {
        setAtomPageId(instagramMessengerBot.pageId);
      }
    }, [atomAccountId, atomPageId]);
  
    return <></>;
  };
  