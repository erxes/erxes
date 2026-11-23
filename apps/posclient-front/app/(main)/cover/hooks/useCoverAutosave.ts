import { useEffect, useRef, useState } from "react"
import { coverEditVersionAtom } from "@/store/cover.store"
import { useAtomValue } from "jotai"

import { onError } from "@/components/ui/use-toast"

import { useCoverSave } from "./useCoverSave"

const AUTOSAVE_DELAY = 700

export type CoverAutosaveState = "idle" | "saving" | "saved"

export const useCoverAutosave = (): CoverAutosaveState => {
  const version = useAtomValue(coverEditVersionAtom)
  const { saveCover } = useCoverSave()
  const [state, setState] = useState<CoverAutosaveState>("idle")
  const openedAtVersion = useRef(version)
  const saveRef = useRef(saveCover)

  useEffect(() => {
    saveRef.current = saveCover
  })

  useEffect(() => {
    if (version === openedAtVersion.current) return
    const timer = setTimeout(() => {
      setState("saving")
      saveRef
        .current()
        .then(() => setState("saved"))
        .catch((error: unknown) => {
          setState("idle")
          onError(error instanceof Error ? error.message : String(error))
        })
    }, AUTOSAVE_DELAY)
    return () => clearTimeout(timer)
  }, [version])

  return state
}
