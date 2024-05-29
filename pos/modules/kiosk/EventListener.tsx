/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { activeCategoryAtom } from "@/store"
import { setInitialAtom } from "@/store/order.store"
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog"
import { addSeconds, formatISO } from "date-fns"
import { useSetAtom } from "jotai"

import useTimer from "@/lib/useTimer"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

const EventListener = () => {
  const [open, changeOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const setInitialState = useSetAtom(setInitialAtom)
  const setCategory = useSetAtom(activeCategoryAtom)

  let timeout: NodeJS.Timeout | null = null

  const restartAutoReset = () => {
    if (timeout) {
      clearTimeout(timeout)
      changeOpen(false)
    }
    timeout = setTimeout(() => {
      changeOpen(true)
    }, 30 * 1000)
  }

  const onMouseMove = () => {
    restartAutoReset()
  }

  useEffect(() => {
    if (pathname === "/") {
      return
    }
    if (!open) {
      // initiate timeout
      restartAutoReset()
      // listen for mouse events
      window.addEventListener("mousemove", onMouseMove)
      // cleanup
      return () => {
        if (timeout) {
          clearTimeout(timeout)
          window.removeEventListener("mousemove", onMouseMove)
        }
      }
    }
  }, [pathname])

  const reset = () => {
    setInitialState()
    setCategory("")

    clearTimeout(timeout as NodeJS.Timeout)
    router.push("/")
    changeOpen(false)
  }

  return (
    <>
      <AlertDialog open={open}>
        <AlertDialogContent>
          {open && (
            <Restart
              expireDate={formatISO(addSeconds(new Date(), 15))}
              reset={reset}
              restartAutoReset={restartAutoReset}
            />
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
const Restart = ({
  expireDate,
  reset,
  restartAutoReset,
}: {
  expireDate: string
  reset: () => void
  restartAutoReset: () => void
}) => {
  const { seconds } = useTimer(expireDate)

  useEffect(() => {
    if (seconds <= 0) {
      reset()
    }
  }, [seconds])

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Ta захиалгаа үргэлжлүүлэх үү?</AlertDialogTitle>
        <AlertDialogDescription>
          Tаны захиалага <span className="font-bold">{seconds}</span> секундын
          дараа цуцлагдана.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel asChild>
          <Button className="font-bold" variant="outline" onClick={reset}>
            Цуцлах
          </Button>
        </AlertDialogCancel>
        <Button className="font-bold" onClick={restartAutoReset}>
          Үргэлжлүүлэх
        </Button>
      </AlertDialogFooter>
    </>
  )
}

export default EventListener
