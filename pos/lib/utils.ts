import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { IPaymentType } from "@/types/config.types"
import { Customer } from "@/types/customer.types"
import { IPaidAmount, OrderItem } from "@/types/order.types"
import { ALL_BANK_CARD_TYPES } from "@/lib/constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const READ_FILE = "/read-file?key="

export const ERXES_SASS = "erxes-saas/"

export const readFile = (url: string = "") => {
  const { NEXT_PUBLIC_MAIN_API_DOMAIN } = getEnv()

  if (url.startsWith(ERXES_SASS)) {
    return NEXT_PUBLIC_MAIN_API_DOMAIN + READ_FILE + url
  }

  if (url.includes(READ_FILE)) {
    const apiUrl = url.split(READ_FILE)[0]

    return url.replace(apiUrl, NEXT_PUBLIC_MAIN_API_DOMAIN || "")
  }
  return url
}

export const getEnv = (): any => {
  const envs: any = {}

  if (typeof window !== "undefined") {
    const appVersion =
      localStorage.getItem(`pos_env_NEXT_PUBLIC_APP_VERSION`) || "OS"

    if (appVersion === "SAAS") {
      const subdomain = window.location.hostname
        .replace(/(^\w+:|^)\/\//, "")
        .split(".")[0]

      for (const envMap of (window as any).envMaps) {
        const value = localStorage.getItem(`pos_env_${envMap.name}`) ?? ""
        envs[envMap.name] = value.replace("<subdomain>", subdomain)
      }

      return envs
    }

    for (const envMap of (window as any).envMaps || []) {
      envs[envMap.name] = localStorage.getItem(`pos_env_${envMap.name}`)
    }
  }

  return envs
}

// Get a value from localStorage
export function getLocal<T>(key: string): T | undefined {
  try {
    const serializedValue = localStorage.getItem(key)
    if (serializedValue !== null) {
      return JSON.parse(serializedValue)
    } else {
      return undefined
    }
  } catch (error) {
    console.error("Error getting data from localStorage:", error)
    return undefined
  }
}

// Set a value in localStorage
export function setLocal<T>(key: string, value: T): void {
  try {
    const serializedValue = JSON.stringify(value)
    localStorage.setItem(key, serializedValue)
  } catch (error) {
    console.error("Error storing data in localStorage:", error)
  }
}

export const resetLocal = () => {
  Object.keys(localStorage).forEach((key) => {
    if (!key.startsWith("pos_env_")) {
      localStorage.removeItem(key)
    }
  })
}

export function hexToHsl(hex: string) {
  // Remove the '#' symbol from the hex code
  hex = hex.replace("#", "")

  // Extract the individual RGB components
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  return rgbToHsl(r, g, b)
}

export function rgbToHsl(r: number, g: number, b: number): string {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h: number,
    s: number,
    l: number = (max + min) / 2

  if (max === min) {
    h = s = 0 // achromatic
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
      default:
        h = 0
        break
    }

    h /= 6
  }

  // Convert h, s, l values to percentages
  h = Math.round(h * 360)
  s = Math.round(s * 100)
  l = Math.round(l * 100)

  return `${h} ${s}% ${l}%`
}

export const formatNum = (num: number | string, splitter?: string): string => {
  const checked = typeof num === "string" ? Number(num) : num

  if (checked) {
    const options = splitter
      ? {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
      : undefined

    return checked.toLocaleString(undefined, options)
  }

  return "0"
}

export const fixNum = (value: any, p = 4) => {
  const cleanNumber = Number((value ?? '').toString().replace(/,/g, ""));

  if (isNaN(cleanNumber)) {
    return 0;
  }
  const multiplier = 10 ** p;

  const big = Math.round(
    Number((cleanNumber * multiplier).toFixed(2))
  );

  return Number((big / multiplier).toFixed(p))
};

export const getCartTotal = (items: OrderItem[]) =>
  (items || []).reduce(
    (total, item) => total + fixNum((item?.count || 0) * (item.unitPrice || 0)),
    0
  )

export const getItemInputs = (items: OrderItem[]) =>
  items.map(
    ({
      _id,
      productId,
      count,
      unitPrice,
      isPackage,
      isTake,
      status,
      manufacturedDate,
      description,
      attachment,
    }) => ({
      _id,
      productId,
      count,
      unitPrice,
      isPackage,
      isTake,
      status,
      manufacturedDate,
      description,
      attachment,
    })
  )

export const getSumsOfAmount = (
  paidAmounts: { type: string; amount: number }[],
  paymentTypes?: IPaymentType[]
) => {
  const result: any = {}

  for (const amount of paidAmounts || []) {
    if (!Object.keys(result).includes(amount.type)) {
      result[amount.type] = {
        title:
          (paymentTypes || []).find((i) => i.type === amount.type)?.title ||
          amount.type,
        value: 0,
      }
    }
    result[amount.type].value += amount.amount
  }

  return result
}

export const mergePaidAmounts = (paidAmounts: IPaidAmount[]): IPaidAmount[] => {
  const obj = {} as any
  paidAmounts.forEach(({ amount, type }) => {
    obj[type] = {
      ...(obj[type] || {}),
      type,
      amount: obj[type] ? obj[type].amount + amount : amount,
    }
  })
  return Object.values(obj)
}

export const filterPaymentTypes = (
  paymentTypes: IPaymentType[] = [],
  isBank: boolean = false
): IPaymentType[] => {
  const filterCondition = (pt: IPaymentType) => {
    return isBank
      ? ALL_BANK_CARD_TYPES.includes(pt.type)
      : !ALL_BANK_CARD_TYPES.includes(pt.type)
  }

  return paymentTypes.filter(filterCondition)
}

export const getPaymentType = (paymentTypes: IPaymentType[], type: string) =>
  (paymentTypes || []).find((pt) => pt.type === type)

export function strToObj(str?: string | { [key: string]: string }) {
  if (!str) return {}
  try {
    const obj = eval("(" + str + ")")
    return obj
  } catch (error) {
    return {}
  }
}

export const paidAmounts = (type: string, amount: number, info?: any) => [
  {
    _id: Math.random().toString(),
    amount,
    type,
    info,
  },
]

export const convertToBase64 = (obj: object) =>
  Buffer.from(JSON.stringify(obj)).toString("base64")

export const parseBase64 = (str: string) => {
  const json = Buffer.from(str, "base64").toString()
  return JSON.parse(json)
}

export const getCustomerLabel = ({
  firstName,
  lastName,
  primaryPhone,
  primaryEmail,
  code,
  _id,
}: Customer) => {
  if (firstName || lastName || primaryEmail || primaryPhone || code) {
    return `${firstName ?? ""} ${lastName ?? ""} ${primaryPhone ?? ""} ${primaryEmail ?? ""
      } ${code ?? ""}`
  }

  return _id || "Unknown"
}
