import { useState } from "react"
import { filterItemClass } from "@/modules/filter"
import { RecordTable } from "@/modules/record-table"
import { coverPrintIdAtom } from "@/store/cover.store"
import { useMutation, type ApolloError } from "@apollo/client"
import { Row } from "@tanstack/react-table"
import { useSetAtom } from "jotai"
import {
  CheckCircle2Icon,
  PencilIcon,
  PrinterIcon,
  Trash2Icon,
} from "lucide-react"

import { Cover } from "@/types/cover.types"
import { useQueryState } from "@/lib/useQueryState"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { onError, toast } from "@/components/ui/use-toast"

import { mutations } from "../graphql"

type ConfirmAction = "confirm" | "delete"

const CONFIRM_TEXT: Record<
  ConfirmAction,
  { title: string; description: string; ok: string; success: string }
> = {
  confirm: {
    title: "Хаалтыг баталгаажуулах уу?",
    description: "Баталгаажуулсан хаалтыг дахин өөрчлөх боломжгүй.",
    ok: "Баталгаажуулах",
    success: "Хаалт баталгаажлаа",
  },
  delete: {
    title: "Хаалтыг устгах уу?",
    description: "Энэ үйлдлийг буцаах боломжгүй. Хаалт бүрмөсөн устгагдана.",
    ok: "Устгах",
    success: "Хаалт устлаа",
  },
}

const buttonClassName = "h-8 rounded px-3 text-[13px] font-semibold"

export const CoverItemAction = ({ row }: { row: Row<Cover> }) => {
  const { _id, status, details } = row.original
  const [, setCoverId] = useQueryState<string>("id")
  const setPrintId = useSetAtom(coverPrintIdAtom)
  const [open, setOpen] = useState(false)
  const [action, setAction] = useState<ConfirmAction | null>(null)
  const terminalResults = (details || []).flatMap(
    (detail) => detail.terminalResults || []
  )

  const options = (kind: ConfirmAction) => ({
    variables: { _id },
    onCompleted() {
      toast({ description: CONFIRM_TEXT[kind].success, variant: "success" })
      setAction(null)
    },
    onError({ message }: ApolloError) {
      onError(message)
    },
    refetchQueries: ["Covers"],
  })

  const [coversConfirm, { loading: loadingConfirm }] = useMutation(
    mutations.coversConfirm,
    options("confirm")
  )
  const [coversDelete, { loading: loadingDelete }] = useMutation(
    mutations.coversDelete,
    options("delete")
  )

  const locked = status === "confirm" || status === "confirming"
  const cannotPublish =
    status === "confirm" ||
    status === "draft" ||
    terminalResults.some((result) => result.response == null)

  const run = (fn: () => void) => () => {
    setOpen(false)
    fn()
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <RecordTable.MoreButton className="h-full w-full" />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-56 overflow-hidden rounded-md bg-background p-0"
        >
          <Command>
            <CommandList className="m-1 max-h-none">
              <CommandItem
                value="print"
                className={filterItemClass}
                disabled={status !== "confirm"}
                onSelect={run(() => {
                  setCoverId(null)
                  setPrintId(_id)
                })}
              >
                <PrinterIcon />
                Хэвлэх
              </CommandItem>
              <CommandItem
                value="edit"
                className={filterItemClass}
                disabled={locked}
                onSelect={run(() => {
                  setPrintId(null)
                  setCoverId(_id)
                })}
              >
                <PencilIcon />
                Өөрчлөх
              </CommandItem>
              <CommandItem
                value="confirm"
                className={filterItemClass}
                disabled={cannotPublish}
                onSelect={run(() => setAction("confirm"))}
              >
                <CheckCircle2Icon />
                {status === "confirming"
                  ? "Дахин баталгаажуулах"
                  : "Баталгаажуулах"}
              </CommandItem>
              <CommandSeparator className="my-1" />
              <CommandItem
                value="delete"
                className={cn(
                  filterItemClass,
                  "text-destructive aria-selected:bg-destructive/10 aria-selected:text-destructive"
                )}
                disabled={locked}
                onSelect={run(() => setAction("delete"))}
              >
                <Trash2Icon />
                Устгах
              </CommandItem>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <AlertDialog
        open={!!action}
        onOpenChange={(next) => {
          if (!next) setAction(null)
        }}
      >
        {action && (
          <AlertDialogContent
            overlayClassName="bg-black/80"
            className="border shadow-lg sm:rounded-lg"
          >
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg">
                {CONFIRM_TEXT[action].title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                {CONFIRM_TEXT[action].description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="pt-2">
              <AlertDialogCancel className={cn(buttonClassName, "mt-0")}>
                Болих
              </AlertDialogCancel>
              <Button
                type="button"
                variant={action === "delete" ? "destructive" : "default"}
                className={buttonClassName}
                loading={loadingConfirm || loadingDelete}
                onClick={() =>
                  action === "delete" ? coversDelete() : coversConfirm()
                }
              >
                {CONFIRM_TEXT[action].ok}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </>
  )
}
