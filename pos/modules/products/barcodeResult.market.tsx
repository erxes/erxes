"use client"

import { useEffect, useState } from "react"
import { barcodeAtom } from "@/store/barcode.store"
import { addToCartAtom } from "@/store/cart.store"
import { useLazyQuery } from "@apollo/client"
import { useAtom, useSetAtom } from "jotai"
import { Loader2 } from "lucide-react"

import { IProduct } from "@/types/product.types"
import { formatNum } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

import { queries } from "./graphql"

const BarcodeResult = () => {
  const [barcode, setBarcodeAtom] = useAtom(barcodeAtom)
  const addToCart = useSetAtom(addToCartAtom)
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  const [searchValue, manufactureDate] = barcode.split("_")

  const handleAddToCart = (product: IProduct) =>
    addToCart(manufactureDate ? { ...product, manufactureDate } : product)

  const [getProducts, { loading, data }] = useLazyQuery(queries.products, {
    onCompleted(data) {
      const { poscProducts: products } = data || {}
      if (products.length === 0) {
        toast({
          description: "Product not found",
        })
      }
      if (products.length === 1) {
        handleAddToCart(products[0])
      }
      if (products.length > 1) {
        setOpen(true)
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

  const products = data?.poscProducts || []

  return (
    <Dialog open={open} onOpenChange={(op) => setOpen(op)}>
      <DialogContent>
        <div className="flex flex-col gap-2">
          {products.map((product: IProduct) => (
            <Button
              key={product._id}
              className="justify-between text-left"
              variant="outline"
              onClick={() => {
                handleAddToCart(product)
                setOpen(false)
              }}
            >
              <div className="flex-1">
                {product.code + " - " + product.name}
              </div>
              <div className="flex-none">{formatNum(product.unitPrice)}₮</div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BarcodeResult
