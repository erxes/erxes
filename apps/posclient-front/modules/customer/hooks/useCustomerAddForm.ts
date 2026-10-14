import { useState } from "react"
import { useMutation } from "@apollo/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  Customer,
  CustomerFormField,
  CustomerFormValue,
} from "@/types/customer.types"
import { toast } from "@/components/ui/use-toast"

import { mutations } from "../graphql"

type CustomerFormValues = Record<string, CustomerFormValue>

interface CustomerAddResponse {
  poscCustomersAdd?: {
    customer?: Customer | null
    duplicate?: Customer | null
  }
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^\+?[0-9\s-]{6,20}$/

const MULTI_TYPES = ["multiSelect", "check"]

const emptyValue = (field: CustomerFormField): CustomerFormValue => {
  if (field.type === "boolean") return false
  if (MULTI_TYPES.includes(field.type)) return []
  return ""
}

const isFilled = (value: CustomerFormValue | undefined) =>
  Array.isArray(value) ? value.length > 0 : !!String(value ?? "").trim()

const buildSchema = (codes: Set<string>) =>
  z.record(z.string(), z.any()).superRefine((values, ctx) => {
    const email = String(values.primaryEmail ?? "").trim()
    const phone = String(values.primaryPhone ?? "").trim()

    if (!email && !phone) {
      const path = codes.has("primaryPhone") ? "primaryPhone" : "primaryEmail"
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [path],
        message: "Имэйл эсвэл утасны аль нэгийг оруулна уу",
      })
    }

    if (email && !EMAIL_PATTERN.test(email)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["primaryEmail"],
        message: "Имэйл буруу байна",
      })
    }

    if (phone && !PHONE_PATTERN.test(phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["primaryPhone"],
        message: "Утасны дугаар буруу байна",
      })
    }
  })

// The search text becomes the first value it plausibly is.
const prefill = (search: string, codes: Set<string>) => {
  const value = search.trim()

  if (!value) return {}
  if (value.includes("@") && codes.has("primaryEmail"))
    return { primaryEmail: value }
  if (PHONE_PATTERN.test(value) && codes.has("primaryPhone"))
    return { primaryPhone: value }
  if (codes.has("firstName")) return { firstName: value }

  return {}
}

const toInput = (fields: CustomerFormField[], values: CustomerFormValues) =>
  Object.fromEntries(
    fields
      .filter((field) => isFilled(values[field.code]))
      .map((field) => {
        const value = values[field.code]
        return [field.code, field.type === "number" ? Number(value) : value]
      })
  )

export const useCustomerAddForm = ({
  rows,
  search,
  onCreated,
}: {
  rows: CustomerFormField[][]
  search: string
  onCreated: (customer: Customer) => void
}) => {
  const fields = rows.flat()
  const codes = new Set(fields.map((field) => field.code))
  const [duplicate, setDuplicate] = useState<Customer | null>(null)

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(buildSchema(codes)),
    defaultValues: {
      ...Object.fromEntries(
        fields.map((field) => [field.code, emptyValue(field)])
      ),
      ...prefill(search, codes),
    },
  })

  const [addCustomer, { loading }] = useMutation<CustomerAddResponse>(
    mutations.poscCustomersAdd,
    {
      onError: (error) =>
        toast({ description: error.message, variant: "destructive" }),
    }
  )

  const submit = form.handleSubmit(async (values) => {
    const { data } = await addCustomer({
      variables: { doc: toInput(fields, values) },
    })
    const result = data?.poscCustomersAdd

    if (result?.duplicate) {
      setDuplicate(result.duplicate)
      return
    }

    if (result?.customer) {
      toast({ description: "Хэрэглэгч бүртгэгдлээ" })
      onCreated(result.customer)
    }
  })

  const pickDuplicate = () => {
    if (duplicate) onCreated(duplicate)
    setDuplicate(null)
  }

  return {
    form,
    loading,
    submit,
    duplicate,
    pickDuplicate,
    dismissDuplicate: () => setDuplicate(null),
  }
}
