import { CustomerFormField, CustomerFormValue } from "@/types/customer.types"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const SEX_OPTIONS = [
  { label: "Тодорхойгүй", value: "0" },
  { label: "Эрэгтэй", value: "1" },
  { label: "Эмэгтэй", value: "2" },
]

const INPUT_TYPES: Record<string, string> = {
  email: "email",
  phone: "tel",
  number: "number",
  date: "date",
}

// Types the POS has no dedicated input for fall back to plain text.
export const CustomerFormInput = ({
  field,
  value,
  onChange,
}: {
  field: CustomerFormField
  value: CustomerFormValue
  onChange: (value: CustomerFormValue) => void
}) => {
  const options = field.type === "sex" ? SEX_OPTIONS : field.options || []

  if (["select", "radio", "sex"].includes(field.type)) {
    return (
      <Select value={String(value ?? "")} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Сонгох" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  if (["multiSelect", "check"].includes(field.type)) {
    const selected = Array.isArray(value) ? value : []

    return (
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <Label
            key={option.value}
            className="flex items-center gap-1.5 font-normal"
          >
            <Checkbox
              checked={selected.includes(option.value)}
              onCheckedChange={(checked: boolean | "indeterminate") =>
                onChange(
                  checked === true
                    ? [...selected, option.value]
                    : selected.filter((item) => item !== option.value)
                )
              }
            />
            {option.label}
          </Label>
        ))}
      </div>
    )
  }

  if (field.type === "boolean") {
    return (
      <Checkbox
        checked={value === true}
        onCheckedChange={(checked: boolean | "indeterminate") =>
          onChange(checked === true)
        }
      />
    )
  }

  if (["textarea", "editor"].includes(field.type)) {
    return (
      <Textarea
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }

  return (
    <Input
      type={INPUT_TYPES[field.type] || "text"}
      value={String(value ?? "")}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
