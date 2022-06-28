const timeframes = `
  query timeframes {
    timeframes {
      _id,
      name,
      description,
      startTime,
      endTime
    }
  }
`;

const salesLogDetail = `
  query salesLogDetail($salesLogId: String) {
    salesLogDetail(salesLogId: $salesLogId) {
      _id,
      name,
      description,
      type,
      date,
      labels,
      status,
      products {
        productId
        intervals {
          label
          value
        }
      },
      departmentId,
      branchId,
      createdUser {
        _id,
        username
      },
      createdAt
    }
  }
`;

const products = `
  query products {
    products {
      _id,
      name,
      categoryId
    }
  } 
`;

const productCategories = `
  query productCategories {
    productCategories {
      _id,
      name
    }
  }
`;

export default {
  timeframes,
  salesLogDetail,
  products,
  productCategories
};
