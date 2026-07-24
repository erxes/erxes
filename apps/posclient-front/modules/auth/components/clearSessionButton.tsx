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

import mutations from "../graphql/mutations"
import { onError } from "@/components/ui/use-toast"

const ClearSessionButton = () => {
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
            aria-label="Clear session & refresh"
            className="absolute bg-transparent border-none shadow-none right-4 top-4 text-muted-foreground hover:bg-gray-100 hover:text-foreground"
          >
            <Paintbrush className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Clear session & refresh</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default ClearSessionButton
