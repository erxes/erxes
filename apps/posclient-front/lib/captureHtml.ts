const RECEIPT_SELECTORS = [".receipt-print", ".report-print"]

const getBrowserDocument = () =>
  typeof globalThis.document === "undefined" ? null : globalThis.document

const findReceiptRoot = (documentRef: Document): HTMLElement | null => {
  for (const selector of RECEIPT_SELECTORS) {
    const el = documentRef.querySelector(selector) as HTMLElement | null
    if (el) return el
  }

  return null
}

const getRulesCss = (sheet: CSSStyleSheet) => {
  try {
    return Array.from(sheet.cssRules)
      .map((rule) => rule.cssText)
      .join("\n")
  } catch {
    return ""
  }
}

const fetchStyleSheetCss = async (href?: string | null) => {
  if (!href) return ""

  try {
    const res = await fetch(href, { credentials: "same-origin" })
    return res.ok ? res.text() : ""
  } catch {
    // Ignore CORS / network failures. QZ can still print inline styles.
    return ""
  }
}

const getStyleSheetCss = async (sheet: CSSStyleSheet) => {
  const rulesCss = getRulesCss(sheet)

  return rulesCss || fetchStyleSheetCss(sheet.href)
}

const getInlineStyleCss = (documentRef: Document) =>
  Array.from(documentRef.head.querySelectorAll("style"))
    .map((el) => el.textContent || "")
    .join("\n")

const resolveTargetElement = (
  documentRef: Document,
  target?: HTMLElement | string | null
) => {
  if (target instanceof globalThis.HTMLElement) return target

  if (typeof target === "string") {
    return documentRef.querySelector(target) as HTMLElement | null
  }

  return findReceiptRoot(documentRef)
}

export const captureDocumentHtml = async (
  target?: HTMLElement | string | null
): Promise<string> => {
  const documentRef = getBrowserDocument()
  if (!documentRef) return ""

  const cssTexts = await Promise.all(
    Array.from(documentRef.styleSheets).map(getStyleSheetCss)
  )
  const inlineStyle = getInlineStyleCss(documentRef)
  const resolvedTarget = resolveTargetElement(documentRef, target)
  const bodyHtml = resolvedTarget
    ? resolvedTarget.outerHTML
    : documentRef.body.innerHTML

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${cssTexts
    .filter(Boolean)
    .join("\n")}\n${inlineStyle}</style></head><body>${bodyHtml}</body></html>`
}
