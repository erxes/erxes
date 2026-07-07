import { useEffect, useState } from "react"
import { addToCartAtom } from "@/store/cart.store"
import { useQuery } from "@apollo/client"
import { useSetAtom } from "jotai"

import { IProduct } from "@/types/product.types"
import { Label } from "@/components/ui/label"
import Loader from "@/components/ui/loader"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { queries } from "../graphql"
import {
  ProductItemButton,
  ProductItemDescription,
  ProductItemImage,
  ProductItemPriceWithWrapper,
  ProductItemTitle,
} from "./productItem/productItem.coffeeShop"

interface BulkField {
  fieldId: string
  title: string
  values: { value: string; label: string }[]
}

// propertiesData values may be stored as a scalar or a single-item array
const normalize = (value: unknown): string => {
  const raw = Array.isArray(value) ? value[0] : value
  return raw == null ? "" : String(raw)
}

const ChooseBulkProperty = ({
  field,
  value,
  onChange,
}: {
  field: BulkField
  value?: string
  onChange: (fieldId: string, value: string) => void
}) => (
  <div>
    <Label className="font-semibold text-xs">{field.title}</Label>
    <RadioGroup
      className="grid grid-cols-3 gap-2 mt-1 font-semibold"
      value={value}
      onValueChange={(val) => onChange(field.fieldId, val)}
    >
      {field.values.map(({ value: optValue, label }) => (
        <div key={optValue}>
          <RadioGroupItem
            value={optValue}
            id={`${field.fieldId}-${optValue}`}
            className="peer sr-only"
          />
          <Label
            htmlFor={`${field.fieldId}-${optValue}`}
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            {label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  </div>
)

const ChooseFromBulkSimilarity = (
  props: IProduct & { setOpen: React.Dispatch<React.SetStateAction<boolean>> }
) => {
  const { _id, setOpen } = props
  const [chosen, setChosen] = useState<IProduct>()
  const [filterFields, setFilterFields] = useState<{ [key: string]: string }>(
    {}
  )
  const addToCart = useSetAtom(addToCartAtom)

  const { data, loading } = useQuery(queries.productBulkSimilarity, {
    variables: { id: _id },
    onCompleted(data) {
      const { products, starProductId } = data?.poscProductBulkSimilarity || {}
      if (products?.length) {
        setChosen(
          products.find((product: IProduct) => product._id === _id) ||
            products.find(
              (product: IProduct) => product._id === starProductId
            ) ||
            products[0]
        )
      }
    },
  })

  const { products = [], fields = [] } = data?.poscProductBulkSimilarity || {}

  // the group config may hold values no member product has; offer only
  // real (deduplicated, stringified) options so every pick resolves
  const selectableFields: BulkField[] = (fields || [])
    .map((field: any) => {
      const seen = new Set<string>()
      const values: BulkField["values"] = []

      for (const option of field?.values || []) {
        const value = normalize(option?.value)
        const hasProduct = (products || []).some(
          (product: IProduct) =>
            normalize(product.propertiesData?.[field.fieldId]) === value
        )

        if (!value || seen.has(value) || !hasProduct) continue

        seen.add(value)
        values.push({
          value,
          label: option?.label == null ? value : String(option.label),
        })
      }

      return { fieldId: field.fieldId, title: field.title, values }
    })
    .filter((field: BulkField) => field.values.length > 0)

  const handleChange = (fieldId: string, value: string) => {
    setFilterFields((prev) => ({ ...prev, [fieldId]: value }))
  }

  useEffect(() => {
    const filterIds = Object.keys(filterFields)
    if (!filterIds.length) return

    const newChosen = (products || []).find((product: IProduct) =>
      filterIds.every(
        (fieldId) =>
          normalize(product.propertiesData?.[fieldId]) === filterFields[fieldId]
      )
    )

    if (newChosen) {
      setChosen(newChosen)
    } else if (filterIds.length > 1) {
      // combination doesn't exist: keep only the last picked value.
      // a lone unmatched key is left untouched to avoid a setState loop
      const lastKey = filterIds[filterIds.length - 1]
      setFilterFields({ [lastKey]: filterFields[lastKey] })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterFields])

  if (loading) return <Loader style={{ height: "350px" }} />

  const { attachment, name, description, unitPrice, remainder, remainders } =
    chosen || {}

  const handleAdd = () => {
    if (chosen) {
      const { name, _id, unitPrice } = chosen
      addToCart({ name, _id, unitPrice })
    }
    setOpen(false)
  }

  return (
    <div className="space-y-3">
      <ProductItemImage
        src={attachment?.url || ""}
        className="max-w-[300px] mx-auto"
      />
      <ProductItemTitle>{name}</ProductItemTitle>
      <ProductItemDescription description={description ?? ""} />
      <ProductItemPriceWithWrapper
        unitPrice={unitPrice}
        remainder={remainder}
        remainders={remainders}
      >
        <ProductItemButton onClick={handleAdd}>Нэмэх</ProductItemButton>
      </ProductItemPriceWithWrapper>
      {selectableFields.map((field) => (
        <ChooseBulkProperty
          key={field.fieldId}
          field={field}
          value={filterFields[field.fieldId] || ""}
          onChange={handleChange}
        />
      ))}
    </div>
  )
}

export default ChooseFromBulkSimilarity
