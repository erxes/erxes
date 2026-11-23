"use client"

import { useMutation } from "@apollo/client"
import { Paintbrush } from "lucide-react"

import { clearAllSessionData } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { onError } from "@/components/ui/use-toast"

import mutations from "../graphql/mutations"

const clearSessionLabel = "Clear session and reload"

export function ClearSessionButton() {
  const [logout, { loading }] = useMutation(mutations.logout, {
    onError({ message }) {
      onError(message)
    },
    onCompleted() {
      clearAllSessionData()
    },
  })

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            loading={loading}
            iconOnly
            onClick={() => logout()}
            aria-label={clearSessionLabel}
            className="size-8 shrink-0 text-muted-foreground"
          >
            <Paintbrush aria-hidden="true" className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" lang="en">
          {clearSessionLabel}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
