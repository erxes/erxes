
const commonParams = `
  $loginPageLogo: String,
  $mainIcon: String,
  $favicon: String,
  $textColor: String
  $backgroundColor:String
  $pageDesc: String
  $url: String
  $email: String
  $type: String
  $template: String
`

const commonValues = `
  loginPageLogo:$loginPageLogo,
  mainIcon:$mainIcon,
  favicon:$favicon,
  textColor:$textColor
  backgroundColor:$backgroundColor 
  pageDesc:$pageDesc 
  url:$url
  email:$email
  type:$type
  template:$template
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
`

export default {
  companyBrandingSave,
  companyBrandingEdit
};
