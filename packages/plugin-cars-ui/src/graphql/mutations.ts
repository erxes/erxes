const commonFields = `
  $ownerId: String,
  $description: String,

  $plateNumber: String,
  $vinNumber: String,
  $colorCode: String,
  $categoryId: String,

  $bodyType: String,
  $fuelType: String,
  $gearBox: String,

  $vintageYear: Float,
  $importYear: Float,
  $attachment: AttachmentInput
`;

const commonVariables = `
  ownerId: $ownerId,
  description: $description,

  plateNumber: $plateNumber,
  vinNumber: $vinNumber,
  colorCode: $colorCode,
  categoryId: $categoryId

  bodyType: $bodyType,
  fuelType: $fuelType,
  gearBox: $gearBox,

  vintageYear: $vintageYear,
  importYear: $importYear,
  attachment: $attachment,
`;

const carsAdd = `
  mutation carsAdd(${commonFields}) {
    carsAdd(${commonVariables}) {
      _id
      plateNumber
      vinNumber
      colorCode
      bodyType
      fuelType
      gearBox
      vintageYear
      importYear
    }
  }
`;

const carsEdit = `
  mutation carsEdit($_id: String!, ${commonFields}) {
    carsEdit(_id: $_id, ${commonVariables}) {
      ownerId,
      description,
      plateNumber,
      vinNumber,
      colorCode,
      bodyType,
      fuelType,
      gearBox,
      vintageYear,
      importYear
    }
  }
`;

const carsRemove = `
  mutation carsRemove($carIds: [String]) {
    carsRemove(carIds: $carIds)
  }
`;

const carsMerge = `
  mutation carsMerge($carIds: [String], $carFields: JSON) {
    carsMerge(carIds: $carIds, carFields: $carFields) {
      _id
    }
  }
`;

const carCategoryParamsDef = `
  $name: String!,
  $code: String!,
  $parentId: String,
  $description: String,
`;

const carCategoryParams = `
  name: $name,
  code: $code,
  parentId: $parentId,
  description: $description,
`;

const carCategoryAdd = `
  mutation carCategoriesAdd(${carCategoryParamsDef}) {
    carCategoriesAdd(${carCategoryParams}) {
      _id
    }
  }
`;

const carCategoryEdit = `
  mutation carCategoriesEdit($_id: String!, ${carCategoryParamsDef}) {
    carCategoriesEdit(_id: $_id, ${carCategoryParams}) {
      _id
    }
  }
`;

const carCategoryRemove = `
  mutation carCategoriesRemove($_id: String!) {
    carCategoriesRemove(_id: $_id)
  }
`;

export default {
  carsAdd,
  carsEdit,
  carsRemove,
  carsMerge,
  carCategoryAdd,
  carCategoryEdit,
  carCategoryRemove
};
