export interface Tag {
    _id: string
    name: string
    colorCode?: string
    order?: string
    __typename?: string
  }

  export interface TagsManagerProps {
    productId: string
    initialTags?: Array<Tag | string>
    uom?: string
    onTagsUpdated?: () => void
  }
