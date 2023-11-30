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

const configFields = `
  _id
  name
  cashierIds
  adminIds
  token
  waitingScreen
  kitchenScreen
  uiOptions {
    colors
    logo
    favIcon
  }
`

const currentConfig = gql`
  query CurrentConfig {
    currentConfig {
      ${configFields}
    }
  }
`

const getPaymentConfig = gql`
  query GetPaymentConfig {
    currentConfig {
      paymentIds
      paymentTypes
      permissionConfig
    }
  }
`

const getPaymentTypes = gql`
  query GetPaymentTypes {
    currentConfig {
      paymentTypes
    }
  }
`

const getCoverConfig = gql`
  query GetCoverConfig {
    currentConfig {
      paymentTypes
      paymentIds
    }
  }
`
const getSettingsConfig = gql`
  query SettingConfig {
    currentConfig {
      branchId
      createdAt
      departmentId
      paymentTypes
      ebarimtConfig {
        ebarimtUrl
        companyRD
      }
    }
  }
`

const getEbarimtConfig = gql`
  query EbarimtConfig {
    currentConfig {
      paymentTypes
      ebarimtConfig {
        footerText
        hasCopy
      }
      uiOptions {
        receiptIcon
      }
      name
    }
  }
`

const getWaitingConfig = gql`
  query getWaitingConfig {
    currentConfig {
      waitingScreen
    }
  }
`

const getWholeConfig = gql`
  query WholeConfig {
    currentConfig {
      ${configFields}
      allowTypes
      banFractions
      paymentIds
      paymentTypes
      permissionConfig
      branchId
      createdAt
      departmentId
      ebarimtConfig {
        ebarimtUrl
        companyRD
        footerText
        hasCopy
      }
      uiOptions {
        receiptIcon
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

const getInitialCategories = gql`
  query InitialCategories {
    currentConfig {
      initialCategoryIds
    }
  }
`
const getCheckoutConfig = gql`
  query checkoutConfig {
    currentConfig {
      allowTypes
      banFractions
    }
  }
`
const uiOptions = gql`
  query UiOptions {
    currentConfig {
      uiOptions {
        texts
        logo
      }
    }
  }
`
const kioskHomeHeader = gql`
  query UiOptions {
    currentConfig {
      uiOptions {
        logo
        kioskHeaderImage
      }
    }
  }
`

const bgImage = gql`
  query UiOptions {
    currentConfig {
      uiOptions {
        bgImage
        texts
      }
    }
  }
`

const queries = {
  posCurrentUser,
  userChanged,
  currentConfig,
  configs,
  getPaymentConfig,
  getSettingsConfig,
  getEbarimtConfig,
  getCoverConfig,
  posUsers,
  getWholeConfig,
  getInitialCategories,
  getCheckoutConfig,
  getWaitingConfig,
  getPaymentTypes,
  uiOptions,
  bgImage,
  kioskHomeHeader,
}

export default queries
