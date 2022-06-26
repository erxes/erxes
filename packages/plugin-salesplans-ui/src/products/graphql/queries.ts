const timeframes = `
  query timeframes {
    getTimeframes {
      _id,
      name,
      description,
      startTime,
      endTime
    }
  }
`;

const getSalesLogDetail = `
  query getSalesLogDetail($salesLogId: String) {
    getSalesLogDetail(salesLogId: $salesLogId) {
      _id,
      name,
      description,
      type,
      date,
      labels,
      products {
        _id
        quantities {
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
  getSalesLogDetail,
  products,
  productCategories
};
