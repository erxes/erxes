// config

import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

import {
  IConfig,
  ICoverConfig,
  ICurrentUser,
  IEbarimtConfig,
  IPermissionConfig,
  ISettingsConfig,
} from "@/types/config.types"
import { IOrderType } from "@/types/order.types"

export const configAtom = atom<IConfig | null>(null)

export const ebarimtConfigAtom = atom<IEbarimtConfig | null>(null)
export const coverConfigAtom = atom<ICoverConfig | null>(null)
export const orderPasswordAtom = atom<string | null>(null)

export const configsAtom = atom<IConfig[] | null>(null)
export const setConfigsAtom = atom(null, (get, set, update: IConfig[]) => {
  set(configsAtom, update)
})
export const currentUserAtom = atom<ICurrentUser | null>(null)

export const isAdminAtom = atom((get) =>
  get(configAtom)?.adminIds?.includes(get(currentUserAtom)?._id || "")
)
export const setCurrentUserAtom = atom(
  null,
  (get, set, update: ICurrentUser | null) => {
    set(currentUserAtom, update)
  }
)
export const allowTypesAtom = atom<IOrderType[] | null>(null)
export const banFractionsAtom = atom<boolean | null>(null)
export const permissionConfigAtom = atom<IPermissionConfig | null>(null)
export const setPermissionConfigAtom = atom(
  () => "",
  (
    get,
    set,
    update: { admins: IPermissionConfig; cashiers: IPermissionConfig }
  ) => {
    const pConfig =
      (update || {})[get(isAdminAtom) ? "admins" : "cashiers"] || {}

    const limit = parseFloat(pConfig.directDiscountLimit + "")

    set(
      permissionConfigAtom,
      pConfig
        ? { ...pConfig, directDiscountLimit: isNaN(limit) ? 0 : limit }
        : null
    )
  }
)

export const setWholeConfigAtom = atom(
  null,
  (
    get,
    set,
    update: IConfig &
      ICoverConfig &
      IEbarimtConfig &
      ISettingsConfig & {
        allowTypes: IOrderType[]
        banFractions: boolean | null
      } & {
        orderPassword: string | null
        permissionConfig: IPermissionConfig
      }
  ) => {
    const {
      paymentIds,
      paymentTypes,
      permissionConfig,
      createdAt,
      ebarimtConfig,
      uiOptions,
      name,
      _id,
      cashierIds,
      adminIds,
      token,
      waitingScreen,
      allowTypes,
      kitchenScreen,
      banFractions,
      orderPassword,
    } = update

    set(configAtom, {
      _id,
      name,
      cashierIds,
      adminIds,
      createdAt,
      token,
      waitingScreen,
      kitchenScreen,
    })
    set(permissionConfigAtom, permissionConfig || null)
    set(ebarimtConfigAtom, {
      ebarimtConfig,
      uiOptions,
      name,
      paymentTypes,
    })
    set(coverConfigAtom, {
      paymentIds,
      paymentTypes,
    })
    set(orderPasswordAtom, orderPassword)
    set(allowTypesAtom, allowTypes)
    set(banFractionsAtom, banFractions)
  }
)

export const similarityConfigAtom = atomWithStorage<string>(
  "similarityConfig",
  "config"
)
