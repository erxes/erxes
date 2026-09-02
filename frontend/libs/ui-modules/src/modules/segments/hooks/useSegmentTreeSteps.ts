import { useCallback, useMemo, useState } from 'react';
import { useSegment } from '../context/SegmentProvider';
import { TNodePath } from '../types';
import { TSegmentNode } from '../types/segmentNode';

export type TSegmentCrumb = {
  path: TNodePath;
  index?: number;
};

const parentOf = (path: TNodePath): TNodePath | undefined => {
  const at = path.lastIndexOf('.children.');

  return at === -1 ? undefined : path.slice(0, at);
};

const indexOf = (path: TNodePath): number | undefined => {
  const match = path.match(/\.children\.(\d+)$/);

  return match ? Number(match[1]) : undefined;
};

export const useSegmentTreeSteps = (root: TNodePath = 'root') => {
  const { form } = useSegment();
  const [openPath, setOpenPath] = useState<TNodePath>(root);

  const settled = useMemo(() => {
    const node = form.getValues(openPath as never) as TSegmentNode | undefined;

    return node?.kind === 'group' ? openPath : root;
  }, [form, openPath, root]);

  const crumbs = useMemo(() => {
    const chain: TSegmentCrumb[] = [];

    for (
      let path: TNodePath | undefined = settled;
      path && path.startsWith(root);
      path = parentOf(path)
    ) {
      chain.unshift({ path, index: indexOf(path) });
    }

    return chain;
  }, [settled, root]);

  const enter = useCallback((path: TNodePath) => setOpenPath(path), []);

  const leaveTo = useCallback(
    (path: TNodePath) => setOpenPath(parentOf(path) || root),
    [root],
  );

  return { openPath: settled, crumbs, enter, leaveTo };
};
