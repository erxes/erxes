# Create eccommerce

## Auth

Authentication API Routes allow you to manage a customer's session, such as login or log out

### Get Current Customer

query:

```gql
query clientPortalCurrentUser {
  clientPortalCurrentUser {
    _id
    email
    firstName
    lastName
    type
    erxesCompanyId
    phone
    avatar
    customer {
      addresses
    }
    erxesCustomerId
    companyRegistrationNumber
  }
}
```

code:

```jsx
useQuery(queries.currentUser, {
  fetchPolicy: 'network-only',
  onCompleted(data) {
    const { clientPortalCurrentUser } = data || {};
    // logic
  },
});
```

Example: [https://github.com/pages-web/techstore/blob/main/src/modules/auth/currentUser.tsx]

### Customer Login

mutation:

```gql
mutation ClientPortalLogin(
  $clientPortalId: String!
  $login: String!
  $password: String!
) {
  clientPortalLogin(
    clientPortalId: $clientPortalId
    login: $login
    password: $password
  )
}
```

code:

```jsx
const [login, { loading }] = useMutation(mutations.login, {
  refetchQueries: [{ query: queries.currentUser }, 'clientPortalCurrentUser'],
  onError(error) {
    return toast.error(error.message);
  },
});
```

### Customer Logout

mutation:

```gql
const logout = gql`
 mutation {
   clientPortalLogout
 }
`;
```

code:

```jsx
const [login, { loading }] = useMutation(mutations.login, {
  refetchQueries: [{ query: queries.currentUser }, 'clientPortalCurrentUser'],
  onError(error) {
    return toast.error(error.message);
  },
});
```

Example: https://github.com/pages-web/techstore/blob/main/src/modules/auth/Login.tsx

# Products

### List Products

query:

```gql
query PoscProducts(
  $type: String
  $categoryId: String
  $searchValue: String
  $vendorId: String
  $tag: String
  $ids: [String]
  $excludeIds: Boolean
  $segment: String
  $segmentData: String
  $isKiosk: Boolean
  $groupedSimilarity: String
  $categoryMeta: String
  $page: Int
  $perPage: Int
  $sortField: String
  $sortDirection: Int
) {
  poscProducts(
    type: $type
    categoryId: $categoryId
    searchValue: $searchValue
    vendorId: $vendorId
    tag: $tag
    ids: $ids
    excludeIds: $excludeIds
    segment: $segment
    segmentData: $segmentData
    isKiosk: $isKiosk
    groupedSimilarity: $groupedSimilarity
    categoryMeta: $categoryMeta
    page: $page
    perPage: $perPage
    sortField: $sortField
    sortDirection: $sortDirection
  ) {
    _id
    name
    description
    attachment {
      url
      name
      type
      size
      duration
    }
    code
    shortName
    type
    barcodes
    barcodeDescription
    unitPrice
    categoryId
    customFieldsData
    customFieldsDataByFieldCode
    createdAt
    tagIds
    vendorId
    uom
    subUoms
    category {
      _id
      name
      description
      attachment {
        url
        name
        type
        size
        duration
      }
      code
      parentId
      meta
      order
      isRoot
      productCount
      maskType
      mask
      isSimilarity
      similarities
    }
    remainder
    soonIn
    soonOut
    remainders
    isCheckRem
    hasSimilarity
    attachmentMore {
      url
      name
      type
      size
      duration
    }
  }
}
```

Query parameters:

|                     |                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------- |
| `isKiosk`           | зэрэг посыг нь ашиглаж байгаа тохиолдолд зөвхөн пос дээр харагдах бараануудыг нуух          |
| `groupedSimilarity` | ижил төстэй бараануудыг багцалж харуулхад багцалсан төрлийг оруулана. `config` / `category` |

Example: https://github.com/erxes/erxes-community/blob/main/pos/modules/products/products.main.tsx (with infinite scroll)

### Product detail

query:

```gql
query PoscProductDetail($id: String, $branchId: String) {
  poscProductDetail(_id: $id, branchId: $branchId) {
    _id
    name
    description
    attachment {
      url
      name
      type
      size
      duration
    }
    code
    shortName
    type
    barcodes
    barcodeDescription
    unitPrice
    categoryId
    customFieldsData
    customFieldsDataByFieldCode
    createdAt
    tagIds
    vendorId
    attachmentMore {
      url
      name
      type
      size
      duration
    }
    uom
    subUoms
    category {
      _id
      name
      description
      attachment {
        url
        name
        type
        size
        duration
      }
      code
      parentId
      meta
      order
      isRoot
      productCount
      maskType
      mask
      isSimilarity
      similarities
    }
    remainder
    soonIn
    soonOut
    remainders
    isCheckRem
    hasSimilarity
  }
}
```

Query parameters:

|            |                             |
| ---------- | --------------------------- |
| `branchId` | Салбар дээрхи үлдэгдэл авах |

Example: https://github.com/pages-web/techstore/blob/main/src/lib/getProductDetail.tsx

### Product categories

query:

```gql
query PoscProductCategories(
  $parentId: String
  $withChild: Boolean
  $searchValue: String
  $status: String
  $excludeEmpty: Boolean
  $meta: String
  $isKiosk: Boolean
  $page: Int
  $perPage: Int
  $sortField: String
  $sortDirection: Int
) {
  poscProductCategories(
    parentId: $parentId
    withChild: $withChild
    searchValue: $searchValue
    status: $status
    excludeEmpty: $excludeEmpty
    meta: $meta
    isKiosk: $isKiosk
    page: $page
    perPage: $perPage
    sortField: $sortField
    sortDirection: $sortDirection
  ) {
    _id
    name
    description
    attachment {
      url
      name
      type
      size
      duration
    }
    code
    parentId
    meta
    order
    isRoot
    productCount
    maskType
    mask
    isSimilarity
    similarities
  }
}
```

Example: https://github.com/erxes/erxes/blob/master/pos/modules/products/components/CategoriesSheet.tsx (Мод байдлаар харуулсан дэлгэж хаах боломжтой)

### Product similarity

query:

```gql
query PoscProductSimilarities($id: String!, $groupedSimilarity: String) {
  poscProductSimilarities(_id: $id, groupedSimilarity: $groupedSimilarity) {
    groups {
      title
      fieldId
    }
    products {
      _id
      name
      description
      attachment {
        url
        name
        type
        size
        duration
      }
      code
      shortName
      type
      barcodes
      barcodeDescription
      unitPrice
      categoryId
      customFieldsData
      customFieldsDataByFieldCode
      createdAt
      tagIds
      vendorId
      attachmentMore {
        url
        name
        type
        size
        duration
      }
      uom
      subUoms
      category {
        _id
        name
        description
        attachment {
          url
          name
          type
          size
          duration
        }
        code
        parentId
        meta
        order
        isRoot
        productCount
        maskType
        mask
        isSimilarity
        similarities
      }
      remainder
      soonIn
      soonOut
      remainders
      isCheckRem
      hasSimilarity
    }
  }
}
```

sort products:

```jsx
products.sort((a: IProduct, b: IProduct) => a.unitPrice - b.unitPrice);
```

Example: https://github.com/erxes/erxes/blob/master/pos/modules/products/components/ChooseFromSimilarities.tsx

# Orders

### Orders

query:

```gql
query Query(
  $searchValue: String
  $statuses: [String]
  $customerId: String
  $customerType: String
  $startDate: Date
  $endDate: Date
  $dateType: String
  $isPaid: Boolean
  $dueStartDate: Date
  $dueEndDate: Date
  $isPreExclude: Boolean
  $slotCode: String
  $page: Int
  $perPage: Int
  $sortField: String
  $sortDirection: Int
) {
  fullOrders(
    searchValue: $searchValue
    statuses: $statuses
    customerId: $customerId
    customerType: $customerType
    startDate: $startDate
    endDate: $endDate
    dateType: $dateType
    isPaid: $isPaid
    dueStartDate: $dueStartDate
    dueEndDate: $dueEndDate
    isPreExclude: $isPreExclude
    slotCode: $slotCode
    page: $page
    perPage: $perPage
    sortField: $sortField
    sortDirection: $sortDirection
  ) {
    _id
    createdAt
    status
    customerId
    number
    cashAmount
    mobileAmount
    billType
    registerNumber
    paidAmounts {
      _id
      type
      amount
      info
    }
    paidDate
    dueDate
    modifiedAt
    totalAmount
    finalAmount
    shouldPrintEbarimt
    printedEbarimt
    billId
    oldBillId
    type
    branchId
    deliveryInfo
    description
    isPre
    origin
    customer {
      _id
      code
      primaryPhone
      primaryEmail
      firstName
      lastName
      primaryAddress
      addresses
    }
    customerType
    items {
      _id
      createdAt
      productId
      categoryId
      count
      orderId
      unitPrice
      discountAmount
      discountPercent
      bonusCount
      productName
      isPackage
      isTake
      productImgUrl
      status
      manufacturedDate
      description
      attachment
    }
    user {
      _id
      createdAt
      username
      firstName
      lastName
      primaryPhone
      primaryEmail
      email
      isActive
      isOwner
      details {
        avatar
        fullName
        shortName
        birthDate
        position
        workStartedDate
        location
        description
        operatorPhone
      }
    }
    putResponses {
      createdAt
      date
      contentType
      contentId
      amount
      billType
      cashAmount
      nonCashAmount
      customerNo
      cityTax
      vat
      taxType
      registerNo
      billId
      macAddress
      lottery
      qrData
      success
      customerName
      modifiedAt
      sendInfo
      internalCode
      lotteryWarningMsg
      errorCode
      message
      getInformation
      returnBillId
      stocks
    }
    returnInfo
    slotCode
  }
}
```

simplified for ecommerce:

```gql
query Query(
  $searchValue: String
  $statuses: [String]
  $customerId: String
  $isPaid: Boolean
  $perPage: Int
  $sortField: String
  $sortDirection: Int
  $page: Int
) {
  fullOrders(
    searchValue: $searchValue
    statuses: $statuses
    customerId: $customerId
    isPaid: $isPaid
    perPage: $perPage
    sortField: $sortField
    sortDirection: $sortDirection
    page: $page
  ) {
    _id
    createdAt
    status
    customerId
    number
    mobileAmount
    billType
    registerNumber
    paidDate
    dueDate
    modifiedAt
    totalAmount
    printedEbarimt
    type
    branchId
    deliveryInfo
    description
    origin
    items {
      _id
      createdAt
      productId
      categoryId
      count
      orderId
      unitPrice
      discountAmount
      discountPercent
      bonusCount
      productName
      isPackage
      isTake
      productImgUrl
      status
      manufacturedDate
      description
      attachment
    }
    putResponses {
      createdAt
      amount
      billType
      cashAmount
      cityTax
      registerNo
      billId
      lottery
      qrData
      success
      modifiedAt
      lotteryWarningMsg
      errorCode
      message
      stocks
    }
  }
}
```

Examples:

get current order: https://github.com/pages-web/techstore/blob/main/src/modules/checkout/currentOrder.tsx

get orders: https://github.com/pages-web/techstore/blob/main/src/pages/profile/orders/index.tsx

### Order Detail

```gql
query OrderDetail($id: String, $customerId: String) {
  orderDetail(_id: $id, customerId: $customerId) {
    _id
    createdAt
    status
    customerId
    number
    cashAmount
    mobileAmount
    billType
    registerNumber
    paidAmounts {
      _id
      type
      amount
      info
    }
    paidDate
    dueDate
    modifiedAt
    totalAmount
    finalAmount
    shouldPrintEbarimt
    printedEbarimt
    billId
    oldBillId
    type
    branchId
    deliveryInfo
    description
    isPre
    origin
    customer {
      _id
      code
      primaryPhone
      primaryEmail
      firstName
      lastName
      primaryAddress
      addresses
    }
    customerType
    items {
      _id
      createdAt
      productId
      categoryId
      count
      orderId
      unitPrice
      discountAmount
      discountPercent
      bonusCount
      productName
      isPackage
      isTake
      productImgUrl
      status
      manufacturedDate
      description
      attachment
    }
    user {
      _id
      createdAt
      username
      firstName
      lastName
      primaryPhone
      primaryEmail
      email
      isActive
      isOwner
      details {
        avatar
        fullName
        shortName
        birthDate
        position
        workStartedDate
        location
        description
        operatorPhone
      }
    }
    putResponses {
      createdAt
      date
      contentType
      contentId
      amount
      billType
      cashAmount
      nonCashAmount
      customerNo
      cityTax
      vat
      taxType
      registerNo
      billId
      macAddress
      lottery
      qrData
      success
      customerName
      modifiedAt
      sendInfo
      internalCode
      lotteryWarningMsg
      errorCode
      message
      getInformation
      returnBillId
      stocks
    }
    returnInfo
    slotCode
    deal
    dealLink
  }
}
```

### OrderAdd

query:

```gql
mutation OrdersAdd(
  $items: [OrderItemInput]
  $totalAmount: Float
  $type: String
  $branchId: String
  $customerId: String
  $customerType: String
  $deliveryInfo: JSON
  $billType: String
  $registerNumber: String
  $slotCode: String
  $origin: String
  $dueDate: Date
  $status: String
  $buttonType: String
  $description: String
  $isPre: Boolean
) {
  ordersAdd(
    items: $items
    totalAmount: $totalAmount
    type: $type
    branchId: $branchId
    customerId: $customerId
    customerType: $customerType
    deliveryInfo: $deliveryInfo
    billType: $billType
    registerNumber: $registerNumber
    slotCode: $slotCode
    origin: $origin
    dueDate: $dueDate
    status: $status
    buttonType: $buttonType
    description: $description
    isPre: $isPre
  ) {
    _id
  }
}
```

Query parameters:

|                  |                                                                        |
| ---------------- | ---------------------------------------------------------------------- |
| `type`           | `eat`, `take`, `delivery`                                              |
| `billType`       | И баримт авах төрөл: хувь хүн - `1`, байгуулга - `3`,                  |
| `registerNumber` | регистерийн дугаар `0000000`, `AA00000000`                             |
| `description`    | хаяг байршилын мэдээлэл нийлүүлж оруулах эсвэл кассчин тэмдэглэл бичих |
| `dueDate`        | Хүлээлгэж өгөх өдөр                                                    |

### OrdersEdit

query:

```gql
mutation OrdersEdit(
  $id: String!
  $items: [OrderItemInput]
  $totalAmount: Float
  $type: String
  $branchId: String
  $customerId: String
  $customerType: String
  $deliveryInfo: JSON
  $billType: String
  $registerNumber: String
  $slotCode: String
  $origin: String
  $dueDate: Date
  $status: String
  $buttonType: String
  $description: String
  $isPre: Boolean
) {
  ordersEdit(
    _id: $id
    items: $items
    totalAmount: $totalAmount
    type: $type
    branchId: $branchId
    customerId: $customerId
    customerType: $customerType
    deliveryInfo: $deliveryInfo
    billType: $billType
    registerNumber: $registerNumber
    slotCode: $slotCode
    origin: $origin
    dueDate: $dueDate
    status: $status
    buttonType: $buttonType
    description: $description
    isPre: $isPre
  ) {
    _id
  }
}
```

args:

```json
{
  "id": null,
  "items": [
    {
      "_id": null,
      "attachment": null,
      "count": null,
      "description": null,
      "isPackage": null,
      "isTake": null,
      "manufacturedDate": null,
      "productId": null,
      "status": null,
      "unitPrice": null
    }
  ],
  "totalAmount": null,
  "type": null,
  "branchId": null,
  "customerId": null,
  "customerType": null,
  "deliveryInfo": null,
  "billType": null,
  "registerNumber": null,
  "slotCode": null,
  "origin": null,
  "dueDate": null,
  "status": null,
  "buttonType": null,
  "description": null,
  "isPre": null
}
```

# Payment

### ordersAddPayment

query:

```gql
mutation OrdersAddPayment(
  $id: String!
  $cashAmount: Float
  $mobileAmount: Float
  $paidAmounts: [PaidAmountInput]
) {
  ordersAddPayment(
    _id: $id
    cashAmount: $cashAmount
    mobileAmount: $mobileAmount
    paidAmounts: $paidAmounts
  ) {
    _id
  }
}
```

args:

```json
{
  "id": null,
  "cashAmount": null,
  "mobileAmount": null,
  "paidAmounts": [
    {
      "_id": null,
      "amount": null,
      "info": null,
      "type": null
    }
  ]
}
```