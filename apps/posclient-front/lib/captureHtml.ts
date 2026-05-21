const RECEIPT_SELECTORS = [".receipt-print", ".report-print"]

const findReceiptRoot = (): HTMLElement | null => {
  if (typeof document === "undefined") return null
  for (const selector of RECEIPT_SELECTORS) {
    const el = document.querySelector(selector) as HTMLElement | null
    if (el) return el
  }
  return null
}

export const captureDocumentHtml = async (
  target?: HTMLElement | string | null
): Promise<string> => {
  if (typeof document === "undefined") return ""

  const cssTexts: string[] = []
  const sheets = Array.from(document.styleSheets)

  for (const sheet of sheets) {
    let rules: CSSRule[] | null = null
    try {
      rules = Array.from(sheet.cssRules)
    } catch {
      rules = null
    }

    if (rules && rules.length) {
      cssTexts.push(rules.map((r) => r.cssText).join("\n"))
      continue
    }

    const styleSheet = sheet as CSSStyleSheet
    if (styleSheet.href) {
      try {
        const res = await fetch(styleSheet.href, { credentials: "same-origin" })
        if (res.ok) {
          cssTexts.push(await res.text())
        }
      } catch {
        // Ignore CORS / network failures. QZ can still print inline styles.
      }
    }
  }

  const inlineStyle = Array.from(document.head.querySelectorAll("style"))
    .map((el) => el.textContent || "")
    .join("\n")

  let resolvedTarget: HTMLElement | null = null
  if (target instanceof HTMLElement) {
    resolvedTarget = target
  } else if (typeof target === "string") {
    resolvedTarget = document.querySelector(target) as HTMLElement | null
  } else {
    resolvedTarget = findReceiptRoot()
  }

  const bodyHtml = resolvedTarget
    ? resolvedTarget.outerHTML
    : document.body.innerHTML

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${cssTexts.join(
    "\n"
  )}\n${inlineStyle}</style></head><body>${bodyHtml}</body></html>`
}
