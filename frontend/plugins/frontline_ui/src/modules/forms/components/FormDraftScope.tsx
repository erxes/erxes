import { useAtom } from 'jotai';
import { useLayoutEffect, type ReactNode } from 'react';
import { formDraftScopeAtom } from '../states/formDraftScope';

export const FormDraftScope = ({
  scope,
  children,
}: {
  scope: string;
  children: ReactNode;
}) => {
  const [activeScope, setScope] = useAtom(formDraftScopeAtom);

  useLayoutEffect(() => {
    setScope(scope);
  }, [scope, setScope]);

  return activeScope === scope ? (
    <div className="contents" key={scope}>
      {children}
    </div>
  ) : null;
};
