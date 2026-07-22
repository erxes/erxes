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
    // Only adopt a server value that isn't the echo of our own save. Without
    // this, a rename resolving while the user keeps typing snaps the field back
    // to the already-sent value and drops the newer keystrokes.
    if (incoming === lastSavedRef.current) return;

    setName(incoming);
    lastSavedRef.current = incoming;
  }, [deal?.name]);

  useEffect(() => {
    const next = debouncedName?.trim();
    // Skip the initial value, a no-op edit, and a value we already sent — the
    // deal prop only catches up once the mutation resolves, so without this the
    // same rename fires twice and logs two activity rows.
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
      className="shadow-none focus-visible:shadow-none p-0 resize-none"
      style={{ fontSize: '1.25rem', lineHeight: '1.75rem' }}
      placeholder={t('deal-name')}
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
  );
};

const MainOverview = ({ deal }: { deal: IDeal }) => {
  return (
    <div className="flex flex-col gap-3">
      <DealName deal={deal} />
      <SalesFormFields deal={deal} />
    </div>
  );
};

export default MainOverview;
