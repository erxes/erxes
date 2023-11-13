// config

import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

import {
  IConfig,
  ICoverConfig,
  ICurrentUser,
  IEbarimtConfig,
  IPaymentConfig,
  ISettingsConfig,
} from "@/types/config.types"
import { IOrderType } from "@/types/order.types"

export const configAtom = atom<IConfig | null>(null)

export const paymentConfigAtom = atom<IPaymentConfig | null>(null)
export const ebarimtConfigAtom = atom<IEbarimtConfig | null>(null)
export const coverConfigAtom = atom<ICoverConfig | null>(null)

export const configsAtom = atom<IConfig[] | null>(null)
export const setConfigsAtom = atom(null, (get, set, update: IConfig[]) => {
  set(configsAtom, update)
})
export const currentUserAtom = atom<ICurrentUser | null>(null)
export const setCurrentUserAtom = atom(
  null,
  (get, set, update: ICurrentUser | null) => {
    set(currentUserAtom, update)
  }
)
export const allowTypesAtom = atom<IOrderType[] | null>(null)
export const banFractionsAtom = atom<boolean | null>(null)

export const setWholeConfigAtom = atom(
  null,
  (
    get,
    set,
    update: IConfig &
      IPaymentConfig &
      IEbarimtConfig &
      ICoverConfig &
      ISettingsConfig & {
        allowTypes: IOrderType[]
        banFractions: boolean | null
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
    set(paymentConfigAtom, {
      paymentIds,
      paymentTypes,
      permissionConfig,
    })
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
    set(allowTypesAtom, allowTypes)
    set(banFractionsAtom, banFractions)
  }
)

export const similarityConfigAtom = atomWithStorage<string>(
  "similarityConfig",
  "config"
)
