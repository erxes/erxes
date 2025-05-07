import { colors, dimensions } from "../styles";

import styled from "styled-components";

const Input = styled.input`
  margin-bottom: 20px;
  width: 100%;
  border: none;
  border-bottom: 1px solid #ddd;
  padding: 4px;
`;

const LoginFormWrapper = styled.div`
  width: 520px;
  background: ${colors.colorWhite};
  color: ${colors.colorCoreGray};
  padding: ${dimensions.headerSpacing}px ${dimensions.headerSpacing}px 30px;
  border-radius: ${dimensions.unitSpacing + 5}px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);

  h2 {
    text-align: center;
    font-weight: 500;
    font-size: 24px;
    color: ${colors.textPrimary};
  }

  > p {
    text-align: center;
    color: ${colors.colorCoreGray};
    margin: ${dimensions.coreSpacing}px;
  }

  input {
    font-size: 14px;
  }

  .info {
    color: #1e87f0;
    background-color: #d4e9ff;
    padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
    border: 1px solid #b8daff;
    border-radius: 5px;
    font-size: 13px;
    display: flex;
    align-items: center;
    margin: ${dimensions.unitSpacing}px 0 ${dimensions.coreSpacing}px;
  }

  .auth-divider {
    position: relative;
    height: 1px;
    margin: 32px 0;
    font-size: 14px;
    background: #eee;
    background: linear-gradient(
      90deg,
      rgba(225, 225, 225, 0) 0%,
      #e1e1e1 50%,
      rgba(225, 225, 225, 0) 100%
    );

    &:after {
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 50%;
      left: 50%;
      -webkit-transform: translate(-50%, -50%);
      transform: translate(-50%, -50%);
      height: 10px;
      width: 34px;
      content: "or";
      background-color: #fff;
    }
  }

  button {
    height: 40px;
    margin-bottom: ${dimensions.coreSpacing}px;
  }

  .links {
    margin-top: ${dimensions.coreSpacing}px;
    text-align: center;
    font-size: 12px;

    > a {
      padding-left: 4px;
      transition: all ease 0.3s;
      color: #1e87f0;
    }
  }

  @media (max-width: 700px) {
    width: 100%;
    padding: 50px 30px 30px;
   }
`;

const Error = styled.label`
  color: ${colors.colorCoreRed};
  margin-top: ${dimensions.unitSpacing - 3}px;
  display: block;
  font-size: 12px;
`;

const WithIconFormControl = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #DFDFE6;
  border-radius: 12px;

  > i {
    padding: 0 0 0 ${dimensions.unitSpacing}px;
    color: ${colors.colorLightGray};
  }

  input {
    border: 0;
    padding-left: ${dimensions.unitSpacing}px;
  }
`;

const SocialLogin = styled.div`
  button {
    line-height: 40px;
    padding: 0 ${dimensions.unitSpacing}px !important;
    border-radius: ${dimensions.coreSpacing + dimensions.unitSpacing}px !important;
    font-size: 12px !important;
    text-transform: uppercase;
    height: 40px !important;

    > div {
      justify-content: center;
    }

    div {
      width: auto !important;

      svg {
        width: 16px;
      }
    }
  }
`;

export { LoginFormWrapper, Input, Error, SocialLogin, WithIconFormControl };
