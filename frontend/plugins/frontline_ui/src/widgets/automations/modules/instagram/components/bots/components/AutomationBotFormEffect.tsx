import {
  selectedInstagramAccountAtom,
  selectedInstagramPageAtom,
} from '@/integrations/instagram/states/instagramStates';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { useIgBotFormContext } from '../context/IgBotFormContext';

export const AutomationBotFormEffect = () => {
  const { instagramMessengerBot, form } = useIgBotFormContext();
  const { setValue } = form;
  const [atomAccountId, setAtomAccountId] = useAtom(selectedInstagramAccountAtom);
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
