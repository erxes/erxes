import { Table, useToast } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { useSetAtom } from 'jotai';
import { renderingBrandDetailAtom } from '../state';
import { useBrandsAdd } from '../hooks/useBrandsAdd';

export const BrandsAddRow = () => {
  const setIsAddingBrand = useSetAtom(renderingBrandDetailAtom);
  const { brandsAdd, loading } = useBrandsAdd();
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
    setIsAddingBrand(false);
  };

  const submit = () => {
    if (handledRef.current) return;
    const name = value.trim();
    if (!name) {
      cancel();
      return;
    }
    handledRef.current = true;
    brandsAdd({
      variables: { name },
      onCompleted: () => setIsAddingBrand(false),
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
      <Table.Cell />
      <Table.Cell />
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
            placeholder="Brand name"
            className="w-full max-w-xs bg-transparent text-sm px-3 py-1.5 outline-none focus:ring-2 focus:ring-inset focus:ring-primary rounded-lg"
            maxLength={288}
          />
        </div>
      </Table.Cell>
    </Table.Row>
  );
};
