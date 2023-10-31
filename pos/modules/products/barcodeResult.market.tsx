"use client"

import { useEffect } from "react"
import { barcodeAtom } from "@/store/barcode.store"
import { addToCartAtom } from "@/store/cart.store"
import { useLazyQuery } from "@apollo/client"
import { useAtom } from "jotai"
import { Loader2 } from "lucide-react"

import { useToast } from "@/components/ui/use-toast"

import { queries } from "./graphql"

const BarcodeResult = () => {
  const [barcode, setBarcodeAtom] = useAtom(barcodeAtom)
  const [, addToCart] = useAtom(addToCartAtom)
  const { toast } = useToast()

  const [searchValue, manufactureDate] = barcode.split("_")

  const [getProducts, { loading }] = useLazyQuery(queries.products, {
    onCompleted(data) {
      const { poscProducts: products } = data || {}
      if (products.length === 0) {
        toast({
          description: "Product not found",
        })
      }
      if (products.length === 1) {
        addToCart(
          manufactureDate ? { ...products[0], manufactureDate } : products[0]
        )
      }
      return setBarcodeAtom("")
    },
  })

  useEffect(() => {
    if (loading) return
    if (!!barcode) {
      getProducts({
        variables: { searchValue, perPage: 5 },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barcode])

  if (loading)
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white/40">
        <Loader2 className="mr-2 animate-spin" />
      </div>
    )

  return <></>
}

export default BarcodeResult
