import { BuilderNode, ElementKind } from '../types';
import { id } from '../utils/id';
import { ATOM_DEFS } from './atoms';
import { MOLECULE_DEFS } from './molecules';
import { ORGANISM_DEFS } from './organisms';
import { ElementDef, defaultPropsFor } from './types';

const ALL: ElementDef[] = [...ATOM_DEFS, ...MOLECULE_DEFS, ...ORGANISM_DEFS];

export const REGISTRY: Record<string, ElementDef> = ALL.reduce(
  (acc, def) => {
    acc[def.type] = def;
    return acc;
  },
  {} as Record<string, ElementDef>,
);

export const getDef = (type: string): ElementDef | undefined =>
  REGISTRY[type];

export const paletteByKind = (): Record<ElementKind, ElementDef[]> => ({
  atom: ALL.filter((d) => d.kind === 'atom' && !d.hidden),
  molecule: ALL.filter((d) => d.kind === 'molecule' && !d.hidden),
  organism: ALL.filter((d) => d.kind === 'organism' && !d.hidden),
});

export const createNodeFromDef = (def: ElementDef): BuilderNode => ({
  id: id(),
  type: def.type,
  kind: def.kind,
  props: defaultPropsFor(def.propsSchema),
  children: def.acceptsChildren ? def.defaultChildren?.() ?? [] : undefined,
});

export const createNodeByType = (type: string): BuilderNode | null => {
  const def = REGISTRY[type];
  if (!def) return null;
  return createNodeFromDef(def);
};
