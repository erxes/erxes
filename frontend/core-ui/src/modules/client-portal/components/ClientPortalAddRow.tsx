import { Table, useToast } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { useSetAtom } from 'jotai';
import { addingClientPortalAtom } from '@/client-portal/state';
import { useCreateClientPortal } from '@/client-portal/hooks/useCreateClientPortal';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const ClientPortalAddRow = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'client-portals' });
  const navigate = useNavigate();
  const setIsAddingClientPortal = useSetAtom(addingClientPortalAtom);
  const { clientPortalAdd, loading } = useCreateClientPortal();
  const { toast } = useToast();
  const [value, setValue] = useState('');
  const handledRef = useRef(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const cancel = () => {
    if (handledRef.current) return;
    handledRef.current = true;
    setIsAddingClientPortal(false);
  };

  const submit = () => {
    if (handledRef.current) return;
    const name = value.trim();
    if (!name) {
      cancel();
      return;
    }
    handledRef.current = true;
    clientPortalAdd({
      variables: { name },
      onCompleted: (data) => {
        setIsAddingClientPortal(false);
        toast({
          title: t('success-exclamation'),
          variant: 'success',
          description: t('client-portal-created'),
        });
        navigate(`${data.clientPortalAdd._id}`);
      },
      onError: (error) => {
        handledRef.current = false;
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <Table.Row>
      <Table.Cell />
      <Table.Cell />
      <Table.Cell className="p-1">
        <div className="h-full flex items-center w-full bg-accent max-w-none rounded-lg">
          <input
            ref={inputRef}
            disabled={loading}
            value={value ?? ''}
            onChange={(e) => setValue(e.target.value)}
            onBlur={submit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submit();
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                cancel();
              }
            }}
            placeholder={t('create-client-portal')}
            className="w-full bg-transparent px-3 py-1.5 outline-none focus:ring-2 focus:ring-inset rounded-lg focus-visible:ring-0 focus-visible:shadow-none resize-none text-xs! font-medium"
          />
        </div>
      </Table.Cell>
      <Table.Cell />
      <Table.Cell />
      <Table.Cell />
    </Table.Row>
  );
};
