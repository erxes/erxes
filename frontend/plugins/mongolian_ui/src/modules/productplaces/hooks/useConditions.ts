import { nanoid } from 'nanoid';

type SetFormData<T> = React.Dispatch<React.SetStateAction<T>>;

export function useConditions<T extends { conditions: any[] }>(
  setFormData: SetFormData<T>,
) {
  const addCondition = () => {
    setFormData((prev) => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        { id: nanoid(), branchId: '', departmentId: '' },
      ],
    }));
  };

  const updateCondition = (id: string, updated: any) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.map((c) => (c.id === id ? updated : c)),
    }));
  };

  const removeCondition = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((c) => c.id !== id),
    }));
  };

  return { addCondition, updateCondition, removeCondition };
}
