import { atom, PrimitiveAtom } from "jotai"

const createAtomFamily = <T>(initialValue: T) => {
  const atoms = new Map<string, PrimitiveAtom<T>>()

  return (id: string) => {
    const existing = atoms.get(id)
    if (existing) return existing

    const created = atom(initialValue)
    atoms.set(id, created)
    return created
  }
}

export const openPopoverState = createAtomFamily(false)

export const filterPopoverViewState = createAtomFamily("root")

export const openDialogState = createAtomFamily(false)

export const filterDialogViewState = createAtomFamily("root")

export const filterPageState = createAtomFamily(1)
