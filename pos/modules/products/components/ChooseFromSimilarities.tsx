import { useEffect, useState } from "react"
import { addToCartAtom } from "@/store/cart.store"
import { similarityConfigAtom } from "@/store/config.store"
import { useQuery } from "@apollo/client"
import { useAtomValue, useSetAtom } from "jotai"

import { CustomField, Group, IProduct } from "@/types/product.types"
import Loader from "@/components/ui/loader"

import { queries } from "../graphql"
import ChooseProperty from "./chooseProperty"
import {
  ProductItemButton,
  ProductItemDescription,
  ProductItemImage,
  ProductItemPriceWithWrapper,
  ProductItemTitle,
} from "./productItem/productItem.coffeeShop"

const ChooseFromSimilarities = (
  props: IProduct & { setOpen: React.Dispatch<React.SetStateAction<boolean>> }
) => {
  const { _id, setOpen } = props
  const groupedSimilarity = useAtomValue(similarityConfigAtom)
  const [chosen, setChosen] = useState<IProduct>()
  const [properties, setGroups] = useState<{
    [key: string]: string[]
  }>({})
  const [filterFields, setFilterFields] = useState<{
    [key: string]: string
  }>({})
  const addToCart = useSetAtom(addToCartAtom)

  const { data, loading } = useQuery(queries.productSimilarities, {
    variables: {
      id: _id,
      groupedSimilarity,
    },
    onCompleted(data) {
      const { products, groups } = data?.poscProductSimilarities || {}
      if (products?.length) {
        setChosen(products.find((product: IProduct) => product._id === _id))
      }
      const customFields: any = [...products]
        .sort((a: IProduct, b: IProduct) => a.unitPrice - b.unitPrice)
        .map((product: IProduct) => product.customFieldsData)

      const getFieldValues = (fieldId: string) => {
        const array: string[] = customFields.map(
          (data: CustomField[]) =>
            data.find((field) => field.field === fieldId)?.value
        )
        const uniqueArray: string[] = []

        for (const element of array) {
          if (!uniqueArray.includes(element)) {
            uniqueArray.push(element)
          }
        }
        return uniqueArray
      }

      if (groups?.length) {
        let radioData = {}

        groups.map(
          (group: Group) =>
            (radioData = {
              ...radioData,
              [group.fieldId]: getFieldValues(group.fieldId),
            })
        )

        setGroups(radioData)
      }
    },
  })
  const { products, groups } = data?.poscProductSimilarities || {}
  const { attachment, name, description, unitPrice } = chosen || {}

  const flattenProducts = (products || []).map(
    ({ customFieldsData, ...product }: IProduct) => {
      let flattenProduct: any = { ...product }
      ;(customFieldsData || []).forEach((field) => {
        flattenProduct[field.field] = field.value
      })
      return flattenProduct
    }
  )

  useEffect(() => {
    const filterIds = Object.keys(filterFields)
    if (filterIds.length) {
      const newChosen = (flattenProducts || []).find((product: any) => {
        let isMatch = true
        filterIds.forEach((id) => {
          if (product[id] !== filterFields[id]) {
            isMatch = false
          }
        })
        if (isMatch) {
          setChosen(product)
        }
        return isMatch
      })
      if (newChosen) {
        setChosen(newChosen)
      } else {
        const lastKey = filterIds[filterIds.length - 1]
        setFilterFields({ [lastKey]: filterFields[lastKey] })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterFields])

  if (loading) return <Loader style={{ height: "350px" }} />

  const handleAdd = () => {
    if (!!chosen) {
      const { name, _id, unitPrice } = chosen
      addToCart({ name, _id, unitPrice })
    }
    setOpen(false)
  }

  return (
    <div className="space-y-3">
      <ProductItemImage src={attachment?.url || ""} />
      <ProductItemTitle>{name}</ProductItemTitle>
      <ProductItemDescription description={description} />
      <ProductItemPriceWithWrapper unitPrice={unitPrice}>
        <ProductItemButton onClick={handleAdd}>Нэмэх</ProductItemButton>
      </ProductItemPriceWithWrapper>
      {Object.keys(properties).map((id) => (
        <ChooseProperty
          key={id}
          group={groups.find((group: Group) => group.fieldId === id)}
          properties={properties[id]}
          value={filterFields[id] || ""}
          setFilterFields={setFilterFields}
        />
      ))}
    </div>
  )
}

export default ChooseFromSimilarities
