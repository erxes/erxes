import { useContext } from 'react';
import { RecordTableTreeContext } from '../contexts/RecordTableTreeContext';
import { useAtom } from 'jotai';
import { recordTableTreeHideChildrenAtomFamily } from '../states/RecordTableTreeState';

export const useRecordTableTreeContext = () => {
  const context = useContext(RecordTableTreeContext);
  if (!context) {
    throw new Error(
      'useRecordTableTreeContext must be used within a RecordTableTreeProvider',
    );
  }
  return context;
};

export const useRecordTableTree = (order: string) => {
  const { id, ordered } = useRecordTableTreeContext();
  const [hideChildren, setHideChildren] = useAtom(
    recordTableTreeHideChildrenAtomFamily(id),
  );

  const toggleHideChildren = (order: string) => {
    setHideChildren(
      hideChildren.includes(order)
        ? hideChildren.filter((child) => child !== order)
        : [...hideChildren, order],
    );
  };

  const isHiddenByParent = hideChildren.some(
    (e) => order?.startsWith(e) && order.length > e.length,
  );

  const isHidden = hideChildren.includes(order);

  return {
    id,
    hideChildren,
    toggleHideChildren,
    ordered,
    isHiddenByParent,
    isHidden,
  };
};
