import {
  selectedFacebookAccountAtom,
  selectedFacebookPageAtom,
} from '@/integrations/facebook/states/facebookStates';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { useFbBotFormContext } from '../context/FbBotFormContext';

export const AutomationBotFormEffect = ({
  isPageFixed,
}: {
  isPageFixed?: boolean;
}) => {
  const { facebookMessengerBot, form } = useFbBotFormContext();
  const { setValue } = form;
  const [atomAccountId, setAtomAccountId] = useAtom(
    selectedFacebookAccountAtom,
  );
  const [atomPageId, setAtomPageId] = useAtom(selectedFacebookPageAtom);

  useEffect(() => {
    // The page comes from the integration, so the shared selection atoms —
    // which the integration setup wizard also writes — must not overwrite it.
    if (isPageFixed) {
      return;
    }
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
  }, [atomAccountId, atomPageId, isPageFixed]);

  return <></>;
};
