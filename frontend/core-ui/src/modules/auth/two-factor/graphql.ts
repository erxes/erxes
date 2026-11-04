import { gql } from '@apollo/client';

export const LOGIN_TWO_FACTOR_SETUP = gql`
  mutation loginTwoFactorSetup($challenge: String!) {
    loginTwoFactorSetup(challenge: $challenge) {
      secret
      otpauthUrl
    }
  }
`;

export const LOGIN_TWO_FACTOR_VERIFY = gql`
  mutation loginTwoFactorVerify($challenge: String!, $code: String!) {
    loginTwoFactorVerify(challenge: $challenge, code: $code)
  }
`;

export const AUTH_TWO_FACTOR_STATUS = gql`
  query authTwoFactorStatus {
    authTwoFactorStatus {
      available
      enabled
      required
      recoveryCodesLeft
    }
  }
`;

export const AUTH_TWO_FACTOR_SETUP = gql`
  mutation authTwoFactorSetup {
    authTwoFactorSetup {
      secret
      otpauthUrl
    }
  }
`;

export const AUTH_TWO_FACTOR_ENABLE = gql`
  mutation authTwoFactorEnable($code: String!) {
    authTwoFactorEnable(code: $code)
  }
`;

export const AUTH_TWO_FACTOR_DISABLE = gql`
  mutation authTwoFactorDisable($code: String!) {
    authTwoFactorDisable(code: $code)
  }
`;

export const AUTH_TWO_FACTOR_RECOVERY_CODES = gql`
  mutation authTwoFactorRecoveryCodes($code: String!) {
    authTwoFactorRecoveryCodes(code: $code)
  }
`;
