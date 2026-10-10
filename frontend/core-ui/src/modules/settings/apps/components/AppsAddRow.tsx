import { useTranslation } from 'react-i18next';
import { Table, useToast } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { useSetAtom } from 'jotai';
import { isAddingAppAtom } from '@/settings/apps/state';
import { useAppsAdd } from '@/settings/apps/hooks/useAppsAdd';

export const AppsAddRow = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'apps' });
  const setIsAddingApp = useSetAtom(isAddingAppAtom);
  const { appsAdd, loading } = useAppsAdd();
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
    setIsAddingApp(false);
  };

  const submit = () => {
    if (handledRef.current) return;
    const name = value.trim();
    if (!name) {
      cancel();
      return;
    }
    handledRef.current = true;
    appsAdd({
      variables: { name },
      onCompleted: () => setIsAddingApp(false),
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
      <Table.Cell colSpan={1} className="p-1">
        <div className="h-full w-full flex items-center bg-accent rounded-lg">
          <input
            ref={inputRef}
            disabled={loading}
            value={value}
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
            placeholder={t('my-app')}
            className="w-full bg-transparent text-sm px-3 py-1.5 outline-none focus:ring-2 focus:ring-inset focus:ring-primary rounded-lg focus-visible:ring-0 focus-visible:shadow-none resize-none"
          />
        </div>
      </Table.Cell>
      <Table.Cell />
      <Table.Cell />
      <Table.Cell />
    </Table.Row>
  );
};
