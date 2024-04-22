const accountAdd = `
  mutation AccountsAdd($code: String, $name: String, $categoryId: String, $parentId: String, $currency: String, $kind: String, $journal: String, $description: String, $branchId: String, $departmentId: String, $isOutBalance: Boolean, $scopeBrandIds: [String]) {
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

export default {
    accountAdd
}