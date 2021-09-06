const commonParams = `
  $loginPageLogo: String,
  $mainIcon: String,
  $favicon: String,
  $textColor: String
  $backgroundColor:String
  $pageDesc: String
  $url: String
`

const commonValues = `
  loginPageLogo:$loginPageLogo,
  mainIcon:$mainIcon,
  favicon:$favicon,
  textColor:$textColor
  backgroundColor:$backgroundColor 
  pageDesc:$pageDesc 
  url:$url
`

const companyBrandingSave = `
  mutation companyBrandingSave(${commonParams}) {
    companyBrandingSave(${commonValues}){
     _id 
    }
  }
`;

const companyBrandingEdit = `
  mutation companyBrandingEdit($_id: String!, ${commonParams}){
    companyBrandingEdit(_id: $_id, ${commonValues}){
      _id
    }
  }
`;
const updateConfigs = `
  mutation configsUpdate($configsMap: JSON!) {
    configsUpdate(configsMap: $configsMap)
  }
`;

export default {
  companyBrandingSave,
  companyBrandingEdit,
  updateConfigs
};