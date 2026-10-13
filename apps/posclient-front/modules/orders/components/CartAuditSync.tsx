"use client"

import { useEffect, useState } from "react"
import { cartAuditQueueAtom } from "@/store/cartAudit.store"
import { configAtom, currentUserAtom } from "@/store/config.store"
import { gql, useApolloClient } from "@apollo/client"
import { useAtom, useAtomValue } from "jotai"

import { onError } from "@/components/ui/use-toast"

const createCartLog = gql`
  mutation posclientCartAuditRecord($doc: PosclientCartChangeLogInput!) {
    posclientCartChangeLogCreate(doc: $doc) {
      _id
    }
  }
`

export const CartAuditSync = () => {
  const client = useApolloClient()
  const [queue, setQueue] = useAtom(cartAuditQueueAtom)
  const user = useAtomValue(currentUserAtom)
  const config = useAtomValue(configAtom)
  const [retry, setRetry] = useState(0)
  const event = queue.find(
    (entry) => entry.actorId === user?._id && entry.posToken === config?.token
  )

  useEffect(() => {
    if (!event) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const { posToken, ...doc } = event
    client
      .mutate({
        mutation: createCartLog,
        variables: { doc },
        refetchQueries: ["posclientOrderAuditLogs", "posclientOrderChangeLogs"],
      })
      .then(() => {
        setQueue((current) =>
          current.filter((entry) => entry.eventId !== event.eventId)
        )
        setRetry(0)
      })
      .catch(() => {
        if (cancelled) return
        if (retry === 0)
          onError("Өөрчлөлтийн лог илгээгдсэнгүй. Дахин илгээхээр хадгаллаа.")
        timer = setTimeout(
          () => setRetry((value) => value + 1),
          Math.min(30000, 5000 * (retry + 1))
        )
      })
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [client, event, retry, setQueue])

  return null
}
