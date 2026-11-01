import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useMutation } from "@apollo/client"
import { atom, useAtomValue, useStore } from "jotai"
import { z } from "zod"
import { Detail } from "@/types/cover.types"
import {
  activeCoverIdAtom,
  coverStatusAtom,
  terminalFetchBusyAtom,
  terminalResultsAtom,
  detailsAtom,
} from "@/store/cover.store"
import { onError, toast } from "@/components/ui/use-toast"
import { mutations } from "../graphql"
import { useCoverSave } from "./useCoverSave"

const pendingSchema = z.object({
  coverId: z.string(),
  resultId: z.string(),
  bank: z.string(),
  response: z.string().optional(),
})
type PendingResult = z.infer<typeof pendingSchema>
const pendingAtom = atom<PendingResult | null>(null)
const storageKey = (id: string) => `cover-terminal-result:${id}`
const message = (error: unknown) =>
  error instanceof Error ? error.message : String(error)

export const readTerminalResponse = async (
  response: Response
): Promise<{ httpStatus: number; result: unknown }> => {
  const text = await response.text()
  let result: unknown = text
  try {
    result = JSON.parse(text)
  } catch {
    /* Some terminals return plain text. */
  }
  return { httpStatus: response.status, result }
}

export const useCoverTerminalFetch = () => {
  const id = useSearchParams().get("id") || ""
  const store = useStore()
  const loading = useAtomValue(terminalFetchBusyAtom)
  const pending = useAtomValue(pendingAtom)
  const { saveCover } = useCoverSave()
  const [saveResult] = useMutation<{
    posclientCoverTerminalResultSave: { details: Detail[] }
  }>(mutations.terminalResultSave, {
    update: (cache) => {
      cache.evict({ id: "ROOT_QUERY", fieldName: "covers" })
    },
  })

  useEffect(() => {
    if (store.get(pendingAtom)?.coverId === id) return
    try {
      const parsed = pendingSchema.safeParse(
        JSON.parse(localStorage.getItem(storageKey(id)) || "null")
      )
      store.set(
        pendingAtom,
        parsed.success && parsed.data.coverId === id ? parsed.data : null
      )
    } catch (error) {
      onError(message(error))
    }
  }, [id, store])

  const persist = async (entry: PendingResult) => {
    const result = await saveResult({
      variables: {
        id: entry.coverId,
        resultId: entry.resultId,
        bank: entry.bank,
        response: entry.response,
      },
    })
    if (!result.data?.posclientCoverTerminalResultSave)
      throw new Error("Терминалын хариу хадгалагдсангүй")
    if (store.get(activeCoverIdAtom) === entry.coverId) {
      store.set(
        detailsAtom,
        result.data.posclientCoverTerminalResultSave.details
      )
    }
  }
  const clearPending = (entry: PendingResult) => {
    const stored = pendingSchema.safeParse(
      JSON.parse(localStorage.getItem(storageKey(entry.coverId)) || "null")
    )
    if (stored.success && stored.data.resultId === entry.resultId)
      localStorage.removeItem(storageKey(entry.coverId))
    if (store.get(pendingAtom)?.resultId === entry.resultId)
      store.set(pendingAtom, null)
  }
  const fetchTerminal = async (
    bank: string,
    request: () => Promise<unknown>
  ): Promise<void> => {
    if (store.get(terminalFetchBusyAtom)) return
    if (["confirm", "confirming"].includes(store.get(coverStatusAtom))) return
    if (store.get(pendingAtom)?.coverId === id) {
      onError("Өмнөх терминалын үр дүнг эхлээд хадгална уу")
      return
    }
    store.set(terminalFetchBusyAtom, true)
    try {
      await saveCover()
      const entry: PendingResult = {
        coverId: id,
        resultId: crypto.randomUUID(),
        bank,
      }
      localStorage.setItem(storageKey(id), JSON.stringify(entry))
      if (store.get(activeCoverIdAtom) === id) store.set(pendingAtom, entry)
      await persist(entry)
      let response: unknown
      try {
        response = await request()
      } catch (error) {
        response = {
          error: message(error),
          outcome: "unknown; verify the terminal before retrying settlement",
        }
        onError(message(error))
      }
      entry.response = JSON.stringify(response ?? null)
      if (store.get(activeCoverIdAtom) === id)
        store.set(pendingAtom, { ...entry })
      try {
        localStorage.setItem(storageKey(id), JSON.stringify(entry))
      } catch (error) {
        onError(`Хариуг браузерт нөөцөлж чадсангүй: ${message(error)}`)
      }
      await persist(entry)
      clearPending(entry)
      toast({ description: "Терминалын хариу хадгалагдлаа" })
    } catch (error) {
      onError(message(error))
    } finally {
      store.set(terminalFetchBusyAtom, false)
    }
  }
  const hasSavedResponse = (entry: PendingResult): boolean =>
    store
      .get(terminalResultsAtom)
      .some(
        (result) =>
          result._id === entry.resultId &&
          result.response != null &&
          (entry.response === undefined || result.response === entry.response)
      )
  const retryPending = async (): Promise<void> => {
    const entry = store.get(pendingAtom)
    if (!entry || entry.coverId !== id || store.get(terminalFetchBusyAtom))
      return
    store.set(terminalFetchBusyAtom, true)
    try {
      if (hasSavedResponse(entry)) {
        clearPending(entry)
        return
      }
      await persist({ ...entry, response: undefined })
      if (hasSavedResponse(entry)) {
        clearPending(entry)
        return
      }
      // An interrupted request has an unknown outcome; record that explicitly.
      const saved = {
        ...entry,
        response:
          entry.response ??
          JSON.stringify({
            error: "Browser closed before the terminal response was recorded",
            outcome: "unknown; verify the terminal before retrying settlement",
          }),
      }
      await persist(saved)
      clearPending(saved)
      toast({ description: "Терминалын үр дүн хадгалагдлаа" })
    } catch (error) {
      onError(message(error))
    } finally {
      store.set(terminalFetchBusyAtom, false)
    }
  }
  return {
    fetchTerminal,
    retryPending,
    loading,
    pending: pending?.coverId === id ? pending : null,
  }
}
