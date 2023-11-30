"use client"

import { Provider, atom } from "jotai"

import { IUser } from "./auth/types"

export const currentUserAtom = atom<IUser | null>(null)

export const setCurrentUserAtom = atom(null, (get, set, update: IUser) => {
  set(currentUserAtom, update)
})

const JotaiProvider = ({ children }: { children: React.ReactNode }) => {
  return <Provider>{children}</Provider>
}

export default JotaiProvider
