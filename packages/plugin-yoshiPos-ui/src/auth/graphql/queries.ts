const posCurrentUser = `
  query posCurrentUser {
    posCurrentUser {
      _id
      createdAt
      username
      email
      isOwner

      details {
        avatar
        fullName
        shortName
        position
        description
        operatorPhone
      }
    }
  }
`;

const userChanged = `
	subscription posUserChanged($userId: String) {
		posUserChanged(userId: $userId)
  }
`;

const currentConfig = `
  query currentConfig {
    currentConfig {
      _id
      name
      description
      userId
      createdAt
      integrationId
      productDetails
      adminIds
      cashierIds
      beginNumber
      maxSkipNumber
      waitingScreen
      kioskMachine
      kitchenScreen
      formSectionTitle
      formIntegrationIds
      brandId
      token

      uiOptions {
        colors
        bgImage
        logo
        favIcon
        receiptIcon
        texts
        kioskHeaderImage
        mobileAppImage
        qrCodeImage
      }

      ebarimtConfig {
        companyRD
        hasVat
        hasCitytax
        vatPercent
        cityTaxPercent
        companyName
        ebarimtUrl
        footerText
      }

      qpayConfig {
        url
        callbackUrl
        username
        password
        invoiceCode
      }
      syncInfo
      catProdMappings {
        _id
        categoryId
        productId
      }
      initialCategoryIds
      kioskExcludeProductIds
    }
  }
`;

export default { posCurrentUser, userChanged, currentConfig };
