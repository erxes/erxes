import { IProduct } from "@/types/product.types"

import ChooseProperty from "./chooseProperty"
import {
  ProductItemButton,
  ProductItemDescription,
  ProductItemImage,
  ProductItemPriceWithWrapper,
  ProductItemTitle,
} from "./productItem/productItem.coffeeShop"

const ChooseFromSimilarities = (props: IProduct) => {
  const { attachment, name, description, unitPrice } = props

  return (
    <div className="space-y-3">
      <ProductItemImage src={attachment?.url || ""} />
      <ProductItemTitle>{name}</ProductItemTitle>
      <ProductItemDescription>{description}</ProductItemDescription>
      <ProductItemPriceWithWrapper unitPrice={unitPrice}>
        <ProductItemButton>Нэмэх</ProductItemButton>
      </ProductItemPriceWithWrapper>
      <ChooseProperty />
      <ChooseProperty />
    </div>
  )
}

export default ChooseFromSimilarities
