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

  $customFieldsData: JSON
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

  customFieldsData: $customFieldsData,
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

export default {
  carsAdd,
  carsEdit,
  carsRemove,
};
