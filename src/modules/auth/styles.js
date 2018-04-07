import styled from 'styled-components';
import { darken } from '../common/styles/color';
import { colors, typography, dimensions } from 'modules/common/styles';

const AuthBox = styled.div`
  background-color: #fff;
  padding: 50px;
  border-radius: 4px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
  border-radius: 17px;
  max-width: 490px;
  margin: 0 auto;
  .logo {
    margin-bottom: 40px;
    text-align: left;
  }
  h2 {
    color: #6b60a6;
    font-size: 30px;
    font-weight: 400;
    margin: 0 0 50px;
  }
  .form-group {
    margin-bottom: 10px;
    .input-group-btn:first-child > .btn {
      padding: 15px 20px;
      min-width: 53px;
      &:focus,
      &:hover {
        outline: 0;
        background: transparent;
        cursor: default;
      }
      i {
        color: ${colors.colorPrimary};
      }
    }
    input {
      outline: 0;
      box-shadow: none;
      padding: 15px 30px;
      height: auto;
      &:focus {
        outline: 0;
        box-shadow: none;
        border-color: #6b60a6;
      }

      &:-webkit-autofill {
        background: none;
      }
    }
  }

  button[type='submit'] {
    transition: background 0.2s ease;
    background-color: ${colors.colorPrimary};
    color: #fff;
    text-transform: uppercase;
    font-weight: 600;
    border: 0;
    padding: 15px;
    border-radius: 10px;
    font-size: 12px;
    &:hover,
    .active.focus,
    .active:focus,
    .focus,
    :active.focus,
    :active:focus,
    :focus {
      background-color: ${darken(colors.colorPrimaryDark, 40)} !important;
      color: #fff;
    }
  }
`;

const Links = styled.div`
  padding: 15px 0 25px 0;
  margin-bottom: 25px;
  text-align: center;
  border-bottom: ${colors.borderDarker} solid 1px;
  a {
    color: ${colors.colorCoreBlack};
    &:hover,
    &:focus {
      color: ${colors.colorPrimaryLight};
    }
  }
`;

const Avatar = styled.div`
  img {
    display: block;
    width: 100px;
    height: 100px;
    border-radius: 50px;
  }
`;

const ProfileWrapper = styled.div`
  display: flex;
`;

const ProfileColumn = styled.div`
  flex: 1;
  padding-right: 40px;

  &:last-of-type {
    padding: 0;
  }
`;

const ColumnTitle = styled.h4`
  text-transform: uppercase;
  font-weight: ${typography.fontWeightMedium};
  border-bottom: 1px dotted ${colors.colorShadowGray};
  padding-bottom: ${dimensions.unitSpacing}px;
  font-size: 14px;
  margin: ${dimensions.coreSpacing}px 0;
`;

export { AuthBox, Links, ProfileWrapper, ProfileColumn, ColumnTitle, Avatar };
