import type { ResolvedChildRef } from '@a2ui/web_core/v1_0';
import { Fragment } from 'react';

export type BuildChild = (id: string, basePath?: string) => React.ReactNode;

export type ChildRefs = readonly (string | ResolvedChildRef)[] | undefined;

export const Children = ({ refs, build }: { refs: ChildRefs; build: BuildChild }) =>
  (refs ?? []).map((ref) =>
    typeof ref === 'string' ? (
      <Fragment key={ref}>{build(ref)}</Fragment>
    ) : (
      <Fragment key={`${ref.basePath}:${ref.id}`}>{build(ref.id, ref.basePath)}</Fragment>
    ),
  );

export const weighted = (weight: number | undefined) =>
  weight === undefined ? '' : 'grow-(--weight) basis-0';

export const Weighted = ({
  weight,
  children,
}: {
  weight: number | undefined;
  children: React.ReactNode;
}) =>
  weight === undefined ? (
    children
  ) : (
    <div style={{ '--weight': weight }} className="flex min-w-0 grow-(--weight) basis-0 flex-col">
      {children}
    </div>
  );

export const numbered = <T,>(items: readonly T[]) => items.map((item, at) => ({ item, at }));
