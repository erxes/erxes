import { Table, useToast } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { useSetAtom } from 'jotai';
import { isAddingAppAtom } from '../state';
import { useAppsAdd } from '../hooks/useAppsAdd';

export const AppsAddRow = () => {
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
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <Table.Row>
      <Table.Cell colSpan={6} className="h-cell">
        <div className="h-full flex items-center px-3">
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
            placeholder="My App"
            className="w-full max-w-sm bg-transparent outline-none text-sm"
          />
        </div>
      </Table.Cell>
    </Table.Row>
  );
};
