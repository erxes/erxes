const accountAdd = `
  mutation accountsAdd($code: String, $name: String, $categoryId: String, $parentId: String, $currency: String, $kind: String, $journal: String, $description: String, $branchId: String, $departmentId: String, $isOutBalance: Boolean, $scopeBrandIds: [String]) {
    accountsAdd(code: $code, name: $name, categoryId: $categoryId, parentId: $parentId, currency: $currency, kind: $kind, journal: $journal, description: $description, branchId: $branchId, departmentId: $departmentId, isOutBalance: $isOutBalance, scopeBrandIds: $scopeBrandIds) {
      _id
      code
      name
      status
      currency
      kind
      journal
      description
      categoryId
      branchId
      departmentId
      isOutBalance
      parentId
      createdAt
      scopeBrandIds
    }
  }
`

const accountCategoryAdd = `
  mutation accountCategoriesAdd($name: String!, $code: String!, $description: String, $parentId: String, $scopeBrandIds: [String], $status: String, $maskType: String, $mask: JSON) {
    accountCategoriesAdd(name: $name, code: $code, description: $description, parentId: $parentId, scopeBrandIds: $scopeBrandIds, status: $status, maskType: $maskType, mask: $mask) {
      _id
      code
      accountCount
      description
      isRoot
      mask
      maskType
      name
      order
      parentId
      scopeBrandIds
      status
    }
  }
`

export default {
    accountAdd,
    accountCategoryAdd
}