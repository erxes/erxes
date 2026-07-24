import { useCallback, useEffect, useRef, useState } from 'react';
import { Textarea } from 'erxes-ui';
import { useDebouncedCallback } from 'use-debounce';
import { useTranslation } from 'react-i18next';

import { IDeal } from '@/deals/types/deals';
import { SalesFormFields } from './SalesFormFields';
import { useDealsContext } from '@/deals/context/DealContext';

const DealName = ({ deal }: { deal: IDeal }) => {
  const { t } = useTranslation('sales');
  const { editDeals } = useDealsContext();
  const [name, setName] = useState(deal?.name || '');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lastSavedRef = useRef(deal?.name || '');

  const saveName = useCallback(
    (nextName: string) => {
      const trimmedName = nextName.trim();
      if (!trimmedName || trimmedName === lastSavedRef.current) return;

      lastSavedRef.current = trimmedName;
      editDeals({
        variables: {
          _id: deal._id,
          name: trimmedName,
        },
      });
    },
    [deal._id, editDeals],
  );

  const debouncedSaveName = useDebouncedCallback(saveName, 1000);

  useEffect(() => {
    const incoming = deal?.name || '';
    if (incoming === lastSavedRef.current) return;

    setName(incoming);
    lastSavedRef.current = incoming;
  }, [deal?.name]);

  useEffect(() => {
    return () => {
      debouncedSaveName.flush();
    };
  }, [debouncedSaveName]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [name]);

  return (
    <Textarea
      ref={textareaRef}
      className="min-h-7 resize-none p-0 text-xl shadow-none focus-visible:shadow-none"
      rows={1}
      placeholder={t('deal-name')}
      value={name}
      onChange={(event) => {
        setName(event.target.value);
        debouncedSaveName(event.target.value);
      }}
      onBlur={debouncedSaveName.flush}
    />
  );
};

export const MainOverview = ({ deal }: { deal: IDeal }) => {
  return (
    <div className="flex flex-col gap-3">
      <DealName deal={deal} />
      <SalesFormFields deal={deal} />
    </div>
  );
};
