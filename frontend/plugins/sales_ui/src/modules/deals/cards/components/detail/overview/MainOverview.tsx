import { useEffect, useRef, useState } from 'react';
import { Textarea } from 'erxes-ui';
import { useDebounce } from 'use-debounce';
import { useTranslation } from 'react-i18next';

import { IDeal } from '@/deals/types/deals';
import { SalesFormFields } from './SalesFormFields';
import { useDealsContext } from '@/deals/context/DealContext';

const DealName = ({ deal }: { deal: IDeal }) => {
  const { t } = useTranslation('sales');
  const { editDeals } = useDealsContext();
  const [name, setName] = useState(deal?.name || '');
  const [debouncedName] = useDebounce(name, 1000);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lastSavedRef = useRef(deal?.name || '');

  useEffect(() => {
    const incoming = deal?.name || '';
    if (incoming === lastSavedRef.current) return;

    setName(incoming);
    lastSavedRef.current = incoming;
  }, [deal?.name]);

  useEffect(() => {
    const next = debouncedName?.trim();
    if (!next || next === deal?.name || next === lastSavedRef.current) return;

    lastSavedRef.current = next;
    editDeals({
      variables: {
        _id: deal._id,
        name: next,
      },
    });
  }, [debouncedName, deal?.name, deal?._id, editDeals]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [name]);

  return (
    <Textarea
      ref={textareaRef}
      className="min-h-7 resize-none p-0 shadow-none focus-visible:shadow-none"
      style={{ fontSize: '1.25rem', lineHeight: '1.75rem' }}
      rows={1}
      placeholder={t('deal-name')}
      value={name}
      onChange={(e) => setName(e.target.value)}
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
