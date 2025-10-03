import { useAtom } from 'jotai';
import { hideChildrenAtomFamily } from 'erxes-ui/modules/select-tree/states/selectTreeStates';
import { useSelectTreeContext } from 'erxes-ui/modules/select-tree/context/SelectTreeContext';

export function useSelectTreeHide(order?: string) {
  const { id } = useSelectTreeContext();
  const [hideChildren, setHideChildren] = useAtom(hideChildrenAtomFamily(id));

  const toggleHideChildren = (order: string) => {
    setHideChildren(
      hideChildren.includes(order)
        ? hideChildren.filter((child) => child !== order)
        : [...hideChildren, order],
    );
  };

  const isHiddenByParent = hideChildren.some(
    (e) => order?.startsWith(e) && order?.length > e.length,
  );

  const isHidden = hideChildren.includes(order ?? '');

  return {
    hideChildren,
    toggleHideChildren,
    isHidden,
    isHiddenByParent,
  } as const;
}
