// config

import { Atom, atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

import { IConfig, ICurrentUser, IPermissionConfig } from "@/types/config.types"

export const configAtom = atom<IConfig | null>(null)

export const orderPasswordAtom = atom<string | undefined>(
  (get) => get(configAtom)?.orderPassword
)
const getConfigField = <K extends keyof IConfig>(field: K): Atom<IConfig[K]> =>
  atom((get) => (get(configAtom) || ({} as IConfig))[field])

export const initialCategoryIdsAtom = getConfigField("initialCategoryIds")
export const paymentTypesAtom = getConfigField("paymentTypes")
export const paymentIdsAtom = getConfigField("paymentIds")
export const allowTypesAtom = getConfigField("allowTypes")
export const banFractionsAtom = getConfigField("banFractions")
export const ebarimtConfigAtom = getConfigField("ebarimtConfig")
export const waitingScreenAtom = getConfigField("waitingScreen")
export const uiOptionsAtom = getConfigField("uiOptions")

export const permissionConfigAtom = atom<IPermissionConfig | undefined>(
  (get) => {
    const role = get(isAdminAtom) ? "admins" : "cashiers"

    const pConfig = (get(configAtom)?.permissionConfig || {})[role] || {}

    const limit = parseFloat(pConfig.directDiscountLimit + "")

    return pConfig
      ? { ...pConfig, directDiscountLimit: isNaN(limit) ? 0 : limit }
      : undefined
  }
)

export const configsAtom = atom<IConfig[] | null>(null)

export const currentUserAtom = atom<ICurrentUser | null>(null)
export const userLabelAtom = atom((get) => {
  const { details, email } = get(currentUserAtom) || {}
  const { fullName, position } = details || {}
  return fullName ? `${fullName} ${position ? `(${position})` : ""}` : email
})
export const isAdminAtom = atom((get) =>
  get(configAtom)?.adminIds?.includes(get(currentUserAtom)?._id || "")
)

export const similarityConfigAtom = atomWithStorage<string>(
  "similarityConfig",
  "config"
)
