import { safeRemainderFields, safeRemainderItemFields } from './queries';

const createSafeRemainderFields = `
  $branchId: String,
  $departmentId: String,
  $date: Date,
  $description: String,
  $productCategoryId: String
`;

const createSafeRemainderVariables = `
  branchId: $branchId,
  departmentId: $departmentId,
  date: $date,
  description: $description,
  productCategoryId: $productCategoryId
`;

const createSafeRemainder = `
  mutation createSafeRemainder(${createSafeRemainderFields}) {
    createSafeRemainder(${createSafeRemainderVariables}) {
      ${safeRemainderFields}
    }
  }
`;

const removeSafeRemainder = `
  mutation removeSafeRemainder($_id: String!) {
    removeSafeRemainder(_id: $_id)
  }
`;

const transactionAdd = `
  mutation transactionAdd($contentId: String, $contentType: String, $products: [TransactionProductInput], $status: String) {
    transactionAdd(contentId: $contentId, contentType: $contentType, products: $products, status: $status)
  }
`;

const updateSafeRemainderItem = `
  mutation updateSafeRemainderItem(
    $_id: String,
    $status: String,
    $remainder: Float,
  ) {
    updateSafeRemainderItem(
      _id: $_id,
      status: $status,
      remainder: $remainder,
    ) {
      ${safeRemainderItemFields}
    }
  }
`;

const removeSafeRemainderItem = `
  mutation removeSafeRemainderItem(
    $_id: String
  ) {
    removeSafeRemainderItem(
      _id: $_id
    )
  }
`;

export default {
  createSafeRemainder,
  removeSafeRemainder,
  transactionAdd,
  updateSafeRemainderItem,
  removeSafeRemainderItem
};
