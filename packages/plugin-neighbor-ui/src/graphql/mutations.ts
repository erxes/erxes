const commonVariables = `
  $name: String
  $type: String
  $createdAt: Date
  $createdBy: String
  $schoolData: SchoolInput
  $kindergardenData: SchoolInput
  $universityData: UniversityInput
  $sohData: SohInput
  $khorooData: KhorooInput
  $envInfoData: EnvInfoInput
  $busStopData: CommonInput
  $parkingData: CommonInput
  $hospitalData: CommonInput
  $pharmacyData: CommonInput
  $districtTownData: DistrictTownInput
`;

const commonValues = `
  name: $name
  type: $type
  createdAt: $createdAt
  createdBy: $createdBy
  schoolData: $schoolData
  kindergardenData: $kindergardenData
  universityData: $universityData
  sohData: $sohData
  khorooData: $khorooData
  envInfoData: $envInfoData
  busStopData: $busStopData
  parkingData: $parkingData
  hospitalData: $hospitalData
  pharmacyData: $pharmacyData
  districtTownData: $districtTownData
`;

const neighborVariables = `
  $productCategoryId: String
  $data: JSON
  $rate: JSON
`;

const neighborValues = `
  productCategoryId: $productCategoryId
  data: $data
  rate: $rate
`;

const neighborSave = `
  mutation neighborSave(${neighborVariables}){
    neighborSave(${neighborValues}) {
      productCategoryId
    }
  }
`;

const neighborItemRemove = `mutation neighborItemRemove($_id:String){
  neighborItemRemove(_id: $_id)
  }
`;

const neighborItemCreate = `
  mutation neighborItemCreate(${commonVariables}){
    neighborItemCreate(${commonValues})
  }
`;

const neighborItemEdit = `
mutation neighborItemEdit( $_id:String ${commonVariables}){
  neighborItemEdit(_id: $_id ${commonValues})
  }
`;

export default {
  neighborSave,
  neighborItemCreate,
  neighborItemEdit,
  neighborItemRemove
};
