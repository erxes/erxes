import qz from "qz-tray"

let connectingPromise: Promise<void> | null = null

const isBrowser = () => typeof globalThis.window !== "undefined"

export const isQzActive = () => {
  if (!isBrowser()) return false
  try {
    return qz.websocket.isActive()
  } catch {
    return false
  }
}

export const connectQz = async (): Promise<void> => {
  if (!isBrowser()) {
    throw new Error("QZ Tray can only be used in the browser")
  }

  if (isQzActive()) return

  if (connectingPromise) return connectingPromise

  connectingPromise = qz.websocket
    .connect({ retries: 1, delay: 1 })
    .then(() => undefined)
    .finally(() => {
      connectingPromise = null
    })

  return connectingPromise
}

export const ensureQzConnected = async (): Promise<boolean> => {
  try {
    await connectQz()
    return true
  } catch {
    return false
  }
}

export const findPrinters = async (): Promise<string[]> => {
  if (!isBrowser()) return []

  if (!isQzActive()) {
    await connectQz()
  }

  const result = await qz.printers.find()
  if (Array.isArray(result)) return result
  if (typeof result === "string") return [result]
  return []
}

export const printHtmlToPrinter = async (
  printerName: string,
  html: string
): Promise<void> => {
  if (!printerName) {
    throw new Error("Printer is not selected")
  }

  if (!isQzActive()) {
    await connectQz()
  }

  const config = qz.configs.create(printerName)
  await qz.print(config, [
    {
      type: "pixel",
      format: "html",
      flavor: "plain",
      data: html,
    },
  ])
}

export const QZ_TRAY_NOT_RUNNING_MESSAGE =
  "QZ Tray ажиллахгүй байна. QZ Tray-г асаана уу."
