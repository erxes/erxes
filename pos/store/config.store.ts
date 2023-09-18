// config

import { atom } from "jotai"

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

export const setWholeConfig = atom(
  null,
  (
    get,
    set,
    update: IConfig &
      IPaymentConfig &
      IEbarimtConfig &
      ICoverConfig &
      ISettingsConfig
  ) => {
    const {
      erxesAppToken,
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
    } = update

    set(configAtom, {
      _id,
      name,
      cashierIds,
      adminIds,
      createdAt,
      token,
      waitingScreen,
    })
    set(paymentConfigAtom, {
      erxesAppToken,
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
  }
)
