import { Table, useToast } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { useSetAtom } from 'jotai';
import { addingClientPortalAtom } from '../state';
import { useCreateClientPortal } from '../hooks/useCreateClientPortal';
import { useNavigate } from 'react-router-dom';

export const ClientPortalAddRow = () => {
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
          title: 'Success!',
          variant: 'success',
          description: 'Client portal created successfully',
        });
        navigate(`${data.clientPortalAdd._id}`);
      },
    });
  };

  return (
    <Table.Row>
      <Table.Cell />
      <Table.Cell />
      <Table.Cell colSpan={6} className="h-cell">
        <div className="h-full flex items-center px-3">
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
            placeholder="Create client portal"
            className="w-full bg-transparent text-sm px-3 py-1.5 outline-none focus:ring-2 focus:ring-inset focus:ring-primary rounded-lg"
          />
        </div>
      </Table.Cell>
    </Table.Row>
  );
};
