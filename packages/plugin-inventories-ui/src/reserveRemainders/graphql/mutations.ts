import { reserveRemFields } from './queries';

const addParamDefs = `
  $departmentIds: [String],
  $branchIds: [String],
  $productCategoryId: String,
  $productId: String,
  $remainder: Float,
`;

const addParams = `
  departmentIds: $departmentIds,
  branchIds: $branchIds,
  productCategoryId: $productCategoryId,
  productId: $productId,
  remainder: $remainder,
`;

const reserveRemsAdd = `
  mutation reserveRemsAdd (${addParamDefs}) {
    reserveRemsAdd(${addParams}) {
      ${reserveRemFields}
    }
  }
`;

const reserveRemEditParamDefs = `
  $remainder: Float
`;

const reserveRemEditParams = `
  remainder: $remainder,
`;

const reserveRemEdit = `
  mutation reserveRemEdit($_id: String!, ${reserveRemEditParamDefs}) {
    reserveRemEdit(_id: $_id, ${reserveRemEditParams}) {
      ${reserveRemFields}
    }
  }
`;

const reserveRemsRemove = `
  mutation reserveRemsRemove ($_ids: [String]) {
    reserveRemsRemove(_ids: $_ids)
  }
`;

export default {
  reserveRemsAdd,
  reserveRemEdit,
  reserveRemsRemove
};
