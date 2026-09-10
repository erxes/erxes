import { nanoid } from 'nanoid';

type SetFormData<T> = React.Dispatch<React.SetStateAction<T>>;

export type ConfigCondition = {
  id: string;
  branchId?: string;
  departmentId?: string;
};

export function useConditions<
  TCondition extends ConfigCondition,
  T extends { conditions: TCondition[] },
>(
  setFormData: SetFormData<T>,
) {
  const addCondition = () => {
    setFormData((prev) => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        { id: nanoid(), branchId: '', departmentId: '' } as TCondition,
      ],
    }));
  };

  const updateCondition = (id: string, updated: TCondition) => {
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
