import { Customer, CustomerFormField } from "@/types/customer.types"
import { getCustomerLabel } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { useCustomerAddForm } from "../hooks/useCustomerAddForm"
import { CustomerFormInput } from "./CustomerFormInput"

const SYSTEM_LABELS: Record<string, string> = {
  firstName: "Нэр",
  middleName: "Дунд нэр",
  lastName: "Овог",
  primaryEmail: "Имэйл",
  primaryPhone: "Утас",
  code: "Код",
  sex: "Хүйс",
  birthDate: "Төрсөн өдөр",
  description: "Тайлбар",
}

const labelOf = (field: CustomerFormField) =>
  (field.isSystem && SYSTEM_LABELS[field.code]) || field.name

export const CustomerAddDialog = ({
  open,
  rows,
  search,
  onCreated,
  onClose,
}: {
  open: boolean
  rows: CustomerFormField[][]
  search: string
  onCreated: (customer: Customer) => void
  onClose: () => void
}) => (
  <Dialog open={open} onOpenChange={(value: boolean) => !value && onClose()}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Хэрэглэгч нэмэх</DialogTitle>
      </DialogHeader>
      {open && (
        <CustomerAddForm
          rows={rows}
          search={search}
          onCreated={onCreated}
          onClose={onClose}
        />
      )}
    </DialogContent>
  </Dialog>
)

const CustomerAddForm = ({
  rows,
  search,
  onCreated,
  onClose,
}: {
  rows: CustomerFormField[][]
  search: string
  onCreated: (customer: Customer) => void
  onClose: () => void
}) => {
  const { form, loading, submit, duplicate, pickDuplicate, dismissDuplicate } =
    useCustomerAddForm({ rows, search, onCreated })

  return (
    <Form {...form}>
      <form onSubmit={submit} className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.map((field) => field.code).join("|")}
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }}
          >
            {row.map((customerField) => (
              <FormField
                key={customerField.code}
                control={form.control}
                name={customerField.code}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{labelOf(customerField)}</FormLabel>
                    <FormControl>
                      <CustomerFormInput
                        field={customerField}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        ))}
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Болих
          </Button>
          <Button type="submit" loading={loading}>
            Бүртгэх
          </Button>
        </DialogFooter>
      </form>
      <AlertDialog
        open={!!duplicate}
        onOpenChange={(value: boolean) => !value && dismissDuplicate()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Аль хэдийн бүртгэлтэй байна</AlertDialogTitle>
            <AlertDialogDescription>
              {duplicate && getCustomerLabel(duplicate)} — энэ хэрэглэгчийг
              сонгох уу?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Буцах</AlertDialogCancel>
            <AlertDialogAction onClick={pickDuplicate}>Сонгох</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  )
}
