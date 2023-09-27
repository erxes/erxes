import { useState } from "react"
import Link from "next/link"
import { useMutation } from "@apollo/client"
import { Row } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Cover } from "@/types/cover.types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { toast, useToast } from "@/components/ui/use-toast"

import { mutations } from "../graphql"

const CoverItemAction = ({ row }: { row: Row<Cover> }) => {
  const { _id, status } = row.original || {}
  const [actionType, setActionType] = useState("")
  const [openSheet, setOpenSheet] = useState(false)
  const { onError } = useToast()
  // const { iframeRef } = useReciept({
  //   onCompleted() {
  //     setOpenSheet(false)
  //   },
  // })

  const options = {
    variables: {
      _id,
    },
    onCompleted() {
      actionType === "delete" && toast({ description: "Амжилттай устлаа" })
    },
    onError,
    refetchQueries: ["covers"],
  }

  const [coversConfirm, { loading }] = useMutation(
    mutations.coversConfirm,
    options
  )
  const [coversDelete, { loading: loadingDelete }] = useMutation(
    mutations.coversDelete,
    options
  )

  const handleSubmit = () =>
    actionType === "delete" ? coversDelete() : coversConfirm()

  const disabled = status === "confirm"

  return (
    <>
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Үйлдэлүүд</DropdownMenuLabel>
            <DropdownMenuItem
              disabled={status !== "confirm"}
              onClick={() => setOpenSheet(true)}
            >
              Хэвлэх
            </DropdownMenuItem>
            <DropdownMenuItem asChild={!disabled} disabled={disabled}>
              {disabled ? (
                "Өөрчлөх"
              ) : (
                <Link href={`/cover?id=${_id}`}>Өөрчлөх</Link>
              )}
            </DropdownMenuItem>
            <AlertDialogTrigger
              asChild
              onClick={() => setActionType("confirm")}
              disabled={disabled}
            >
              <DropdownMenuItem>Баталгаажуулах</DropdownMenuItem>
            </AlertDialogTrigger>
            <DropdownMenuSeparator />

            <AlertDialogTrigger
              asChild
              onClick={() => setActionType("delete")}
              disabled={disabled}
            >
              <DropdownMenuItem className="text-destructive">
                Устгах
              </DropdownMenuItem>
            </AlertDialogTrigger>

            {/* </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Та үнэхээр итгэлтэй байна уу?</AlertDialogTitle>
            <AlertDialogDescription>
              Энэ үйлдлийг буцаах боломжгүй. Энэ нь таны хаалтыг бүрмөсөн{" "}
              {actionType === "delete" ? "устгана" : "баталгаажуулна"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Цуцлах</AlertDialogCancel>
            <AlertDialogAction
              variant={actionType === "delete" ? "destructive" : "default"}
              asChild
              onClick={handleSubmit}
            >
              <Button loading={loading || loadingDelete}>Үргэлжлүүлэх</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Sheet
        open={openSheet}
        onOpenChange={() => setOpenSheet((prev) => !prev)}
      >
        <SheetContent closable className="flex flex-col p-4 sm:max-w-xs">
          {openSheet && (
            <iframe
              // ref={iframeRef}
              src={"/reciept/cover?id=" + _id}
              className="w-100 block flex-auto overflow-y-auto"
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

export default CoverItemAction
