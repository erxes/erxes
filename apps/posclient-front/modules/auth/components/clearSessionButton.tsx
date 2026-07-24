"use client"

import { Trash2 } from "lucide-react"

import { clearAllSessionData } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const ClearSessionButton = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clearAllSessionData}
            aria-label="Clear session & refresh"
            className="absolute right-4 top-4 border-none bg-transparent text-muted-foreground shadow-none hover:bg-gray-100 hover:text-foreground"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Clear session & refresh</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default ClearSessionButton
