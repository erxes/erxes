"use client"

import { Provider, atom } from "jotai"

import { IExm, IUser } from "./auth/types"

export const currentUserAtom = atom<IUser | null>(null)

export const setCurrentUserAtom = atom(null, (get, set, update: IUser) => {
  set(currentUserAtom, update)
})

export const exmAtom = atom<IExm | null>(null)

export const setExmAtom = atom(null, (get, set, update: IExm) => {
  set(exmAtom, update)
})

const JotaiProvider = ({ children }: { children: React.ReactNode }) => {
  return <Provider>{children}</Provider>
}

export default JotaiProvider
