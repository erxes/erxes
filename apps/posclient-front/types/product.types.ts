export interface IProductBase {
  _id: string
  name: string
  unitPrice: number
  isPackage?: boolean
}

export interface Group {
  fieldId: string
  title: string
}

export interface IProduct extends IProductBase {
  categoryId?: string | null
  type?: string | null
  description?: string | null
  attachment?: { url?: string } | null
  remainder?: number
  remainders?: { location: string; remainder: number }[]
  isCheckRem?: boolean
  code?: string
  manufacturedDate?: string
  hasSimilarity?: boolean
  propertiesData?: Record<string, string>
  category?: ICategory
}

export interface IUseProducts {
  loading: boolean
  products: IProduct[]
  productsCount: number
  handleLoadMore: () => void
}

export interface ICategory {
  _id: string
  name: string
  isRoot: boolean
  order: string
}
