const editOrganizationInfo = `
  mutation editOrganizationInfo($icon: String, $logo: String, $link: String!, $name: String! $iconColor: String, $description: String, $backgroundColor: String, $favicon: String, $domain: String, $textColor: String) {
    editOrganizationInfo(icon: $icon, logo: $logo, link: $link, name: $name, iconColor: $iconColor, description: $description, backgroundColor: $backgroundColor, favicon: $favicon, domain: $domain, textColor: $textColor) {
      name
      subdomain
    }
  }
`;

const editOrganizationDomain = `
  mutation editOrganizationDomain($type: String, $domain: String) {
    editOrganizationDomain(type: $type, domain: $domain) {
      name
      subdomain
    }
  }
`;

const usePromoCode = `
  mutation usePromoCode($code: String!) {
    usePromoCode(code: $code) {
      _id
    }
  } 
`;

export default {
  editOrganizationInfo,
  editOrganizationDomain,
  usePromoCode,
};
