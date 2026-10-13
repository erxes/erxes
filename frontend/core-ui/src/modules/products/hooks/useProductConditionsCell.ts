import { useState } from 'react';
import { useProductConditionToggle } from '@/products/hooks/useProductConditionToggle';
import { IProductCondition } from '@/products/settings/components/productsConfig/condition/types';
import { useProductConditions } from '@/products/settings/hooks/useProductConditions';

export const useProductConditionsCell = (
  productId: string,
  conditionCodes: string[],
) => {
  const { conditions, loading } = useProductConditions();
  const { toggle } = useProductConditionToggle(productId, conditionCodes);
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const nameByCode = new Map(conditions.map(({ code, name }) => [code, name]));

  const term = search.trim().toLowerCase();
  // Offered unless the text already names or codes a condition.
  const canCreate =
    !loading &&
    !!term &&
    !conditions.some(
      ({ code, name }) =>
        code.toLowerCase() === term || name.toLowerCase() === term,
    );

  const handleCreated = (condition: IProductCondition) => {
    setNewName('');
    setSearch('');
    toggle(condition.code);
  };

  const onOpenChange = (open: boolean) => {
    if (!open) {
      setNewName('');
      setSearch('');
    }
  };

  return {
    conditions,
    loading,
    nameByCode,
    search,
    setSearch,
    canCreate,
    newName,
    startCreate: () => setNewName(search.trim()),
    cancelCreate: () => setNewName(''),
    handleCreated,
    onOpenChange,
    toggle,
  };
};
