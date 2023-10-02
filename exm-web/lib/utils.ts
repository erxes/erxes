import { ClassValue, clsx } from "clsx"
import { format } from "date-fns"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const READ_FILE = "/read-file?key="

export const isValidURL = (url: string) => {
  try {
    return Boolean(new URL(url))
  } catch (e) {
    return false
  }
}

export const readFile = (value: string, width?: number): string => {
  const env = getEnv()

  if (
    !value ||
    isValidURL(value) ||
    (typeof value === "string" && value.includes("http")) ||
    (typeof value === "string" && value.startsWith("/"))
  ) {
    return value
  }

  const NEXT_PUBLIC_MAIN_API_DOMAIN = env.NEXT_PUBLIC_MAIN_API_DOMAIN || ""

  let url = `${NEXT_PUBLIC_MAIN_API_DOMAIN}/read-file?key=${value}`

  if (width) {
    url += `&width=${width}`
  }

  return url
}

export const formatDate = (date: string) =>
  !!date ? format(new Date(date), "yyyy.MM.dd HH:mm") : ""

export const getEnv = (): any => {
  const envs: any = {}

  if (typeof window !== "undefined") {
    for (const envMap of (window as any).envMaps || []) {
      envs[envMap.name] = localStorage.getItem(`exm_env_${envMap.name}`)
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
