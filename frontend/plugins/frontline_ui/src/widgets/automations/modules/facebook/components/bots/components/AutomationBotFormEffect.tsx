import {
  selectedFacebookAccountAtom,
  selectedFacebookPageAtom,
} from '@/integrations/facebook/states/facebookStates';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { TFacebookBotForm } from '~/widgets/automations/modules/facebook/components/bots/states/facebookBotForm';
import { useFbBotFormContext } from '../context/FbBotFormContext';

type Props = {
  formDefaultValues?: any;
};

export const AutomationBotFormEffect = () => {
  const { facebookMessengerBot, form } = useFbBotFormContext();
  const { setValue } = form;
  const [atomAccountId, setAtomAccountId] = useAtom(
    selectedFacebookAccountAtom,
  );
  const [atomPageId, setAtomPageId] = useAtom(selectedFacebookPageAtom);

  useEffect(() => {
    if (atomAccountId) {
      setValue('accountId', atomAccountId);
    }
    if (atomPageId) {
      setValue('pageId', atomPageId);
    }
    if (facebookMessengerBot?.accountId && !atomAccountId) {
      setAtomAccountId(facebookMessengerBot.accountId);
    }
    if (facebookMessengerBot?.pageId && !atomPageId) {
      setAtomPageId(facebookMessengerBot.pageId);
    }
  }, [atomAccountId, atomPageId]);

  return <></>;
};
