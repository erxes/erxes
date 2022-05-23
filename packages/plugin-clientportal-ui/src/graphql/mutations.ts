import { commonFields } from './queries';

const createOrUpdateConfig = `
  mutation clientPortalConfigUpdate(
    $_id: String
    $name: String
    $description: String
    $logo: String
    $icon: String
    $url: String
    $domain: String
    $styles: StylesParams
    $mobileResponsive: Boolean
    $otpConfig: OTPConfigInput
    $brandId: String
  ) {
    clientPortalConfigUpdate(
      _id: $_id,
      name: $name,
      description: $description,
      url: $url,
      logo: $logo,
      icon: $icon,
      domain: $domain,
      styles: $styles
      mobileResponsive: $mobileResponsive
      otpConfig: $otpConfig
      brandId: $brandId
    ) {
      ${commonFields}
    }
  }
`;

const remove = `
  mutation clientPortalRemove(
    $_id: String!
  ) {
    clientPortalRemove(
      _id: $_id,
    )
  }
`;

export default { createOrUpdateConfig, remove };
