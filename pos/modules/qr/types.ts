export interface QrCategory {
  _id: string
  name: string
  code?: string
  order?: string
  parentId?: string | null
  isRoot?: boolean
}

export interface QrProduct {
  _id: string
  name: string
  code?: string
  categoryId?: string
  unitPrice: number
  description?: string
  attachment?: { url?: string } | null
}

export interface QrCartItem {
  _id: string
  productId: string
  productName: string
  unitPrice: number
  count: number
  description?: string
  productImgUrl?: string
}
