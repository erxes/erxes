
const companyBrandingSave = `
  mutation companyBrandingSave($textColor:String, $backgroundColor:String, $pageDesc: String, $url: String, $email: String, $type: String) {
    companyBrandingSave(textColor:$textColor, backgroundColor:$backgroundColor, pageDesc:$pageDesc, url:$url, email:$email, type:$type){
      _id
    }
  }
`;

export default {
  companyBrandingSave
};
