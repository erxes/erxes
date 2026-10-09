type JsonRecord = Record<string, unknown>

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === "object" && value !== null

const isBlockNote = (value: unknown): boolean => {
  if (Array.isArray(value)) {
    return value.every((item) => isRecord(item) && "type" in item)
  }

  return isRecord(value) && "type" in value
}

const extractInlineText = (content: unknown[]): string =>
  content
    .map((item) => {
      if (!isRecord(item)) {
        return ""
      }

      if (typeof item.text === "string") {
        return item.text
      }

      if (Array.isArray(item.content)) {
        return extractInlineText(item.content)
      }

      return ""
    })
    .join("")

const extractBlocksText = (blocks: unknown[]): string => {
  const lines: string[] = []

  for (const block of blocks) {
    if (!isRecord(block)) {
      continue
    }

    const line = Array.isArray(block.content)
      ? extractInlineText(block.content)
      : ""

    if (line) {
      lines.push(line)
    }

    if (Array.isArray(block.children) && block.children.length > 0) {
      const childText = extractBlocksText(block.children)

      if (childText) {
        lines.push(childText)
      }
    }
  }

  return lines.join("\n").trim()
}

export const blockNoteToPlainText = (value?: string | null): string | null => {
  if (!value?.trim()) {
    return null
  }

  const trimmed = value.trim()

  if (!trimmed.startsWith("[") && !trimmed.startsWith("{")) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(trimmed)

    if (!isBlockNote(parsed)) {
      return null
    }

    const blocks = Array.isArray(parsed) ? parsed : [parsed]

    return extractBlocksText(blocks)
  } catch {
    return null
  }
}

const decodeHtmlEntities = (value: string): string =>
  value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")

export const richTextToPlainText = (value?: string | null): string => {
  const blockText = blockNoteToPlainText(value)

  if (blockText !== null) {
    return blockText
  }

  return decodeHtmlEntities(
    (value || "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
      .replace(/<[^>]*>/g, "")
  )
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}
