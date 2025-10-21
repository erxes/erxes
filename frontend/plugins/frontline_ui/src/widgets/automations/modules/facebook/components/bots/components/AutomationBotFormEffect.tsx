import {
  selectedFacebookAccountAtom,
  selectedFacebookPageAtom,
} from '@/integrations/facebook/states/facebookStates';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { TFacebookBotForm } from '~/widgets/automations/modules/facebook/components/bots/states/facebookBotForm';

type Props = {
  form: UseFormReturn<TFacebookBotForm>;
  formDefaultValues?: any;
};

export const AutomationBotFormEffect = ({ form, formDefaultValues }: Props) => {
  const [atomAccountId, setAtomAccountId] = useAtom(
    selectedFacebookAccountAtom,
  );
  const [atomPageId, setAtomPageId] = useAtom(selectedFacebookPageAtom);

  useEffect(() => {
    if (atomAccountId) {
      form.setValue('accountId', atomAccountId);
    }
    if (atomPageId) {
      form.setValue('pageId', atomPageId);
    }
    if (formDefaultValues?.accountId && !atomAccountId) {
      setAtomAccountId(formDefaultValues.accountId);
    }
    if (formDefaultValues?.pageId && !atomPageId) {
      setAtomPageId(formDefaultValues.pageId);
    }
  }, [atomAccountId, atomPageId]);

  return <></>;
};
