// config

import { strToObj } from "@/lib/utils"
import { IConfig, ICurrentUser, IPermissionConfig } from "@/types/config.types"
import { Atom, atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

export const configAtom = atomWithStorage<IConfig | null>("posConfig", null)

export const orderPasswordAtom = atom<string | undefined>(
  (get) => get(configAtom)?.orderPassword
)
const getConfigField = <K extends keyof IConfig>(field: K): Atom<IConfig[K]> =>
  atom((get) => (get(configAtom) || ({} as IConfig))[field])

export const initialCategoryIdsAtom = getConfigField("initialCategoryIds")
export const paymentIdsAtom = getConfigField("paymentIds")
export const allowTypesAtom = getConfigField("allowTypes")
export const banFractionsAtom = getConfigField("banFractions")
export const ebarimtConfigAtom = getConfigField("ebarimtConfig")
export const waitingScreenAtom = getConfigField("waitingScreen")
export const uiOptionsAtom = getConfigField("uiOptions")
export const paymentTypesAtom = atom(
  (get) => (
    (get(configAtom) || ({} as IConfig))['paymentTypes'] || []
  ).map(pt => (
    {
      ...pt,
      config: strToObj(pt.config)
    }
  ))
)

export const permissionConfigAtom = atom<IPermissionConfig | undefined>(
  (get) => {
    const role = get(isAdminAtom) ? "admins" : "cashiers"

    const pConfig = get(configAtom)?.permissionConfig?.[role] ?? {}

    const limit = parseFloat(pConfig.directDiscountLimit + "")

    return pConfig
      ? { ...pConfig, directDiscountLimit: isNaN(limit) ? 0 : limit }
      : undefined
  }
)

export const directDiscountConfigAtom = atom((get) => {
  const { directDiscount, directDiscountLimit } =
    get(permissionConfigAtom) || {}

  return {
    allowDirectDiscount: !!directDiscount && !!directDiscountLimit,
    directDiscountLimit: directDiscountLimit || 0,
  }
})

export const configsAtom = atom<IConfig[] | null>(null)

export const currentUserAtom = atom<ICurrentUser | null>(null)

export const userLabelAtom = atom((get) => {
  const { details, email } = get(currentUserAtom) || {}
  const { fullName, position } = details || {}
  const role = position ? `(${position})` : ""
  return fullName ? `${fullName} ${role}` : email
})

export const isAdminAtom = atom((get) =>
  get(configAtom)?.adminIds?.includes(get(currentUserAtom)?._id || "")
)

export const similarityConfigAtom = atomWithStorage<string>(
  "similarityConfig",
  "config"
)
