import { gql } from "@apollo/client"

const posCurrentUser = gql`
  query posCurrentUser {
    posCurrentUser {
      _id
      email
      details {
        fullName
        position
      }
    }
  }
`

const userChanged = gql`
  subscription posUserChanged($userId: String) {
    posUserChanged(userId: $userId)
  }
`

const currentConfig = gql`
  query CurrentConfig {
    currentConfig {
      _id
      name
      cashierIds
      adminIds
      token
      waitingScreen
      kitchenScreen
      erxesAppToken
      orderPassword
      uiOptions {
        colors
        logo
        bgImage
        favIcon
        receiptIcon
        texts
        kioskHeaderImage
      }
      allowTypes
      banFractions
      paymentIds
      paymentTypes
      permissionConfig
      branchId
      createdAt
      departmentId
      initialCategoryIds
      ebarimtConfig {
        companyName
        ebarimtUrl
        companyRD
        footerText
        hasCopy
      }
    }
  }
`

const configs = gql`
  query posclientConfigs {
    posclientConfigs {
      name
      token
      description
    }
  }
`

const posUsers = gql`
  query PosUsers {
    posUsers {
      _id
      firstName
      lastName
      email
      primaryPhone
    }
  }
`

const queries = {
  posCurrentUser,
  userChanged,
  currentConfig,
  configs,
  posUsers,
}

export default queries
