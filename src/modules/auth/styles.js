import styled from 'styled-components';
import { colors, typography, dimensions } from 'modules/common/styles';

const AuthBox = styled.div`
  background-color: #fff;
  padding: 70px 60px;
  border-radius: 4px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);

  h2 {
    color: #6b60a6;
    font-size: 30px;
    font-weight: 400;
    margin: 0 0 50px;
  }

  input {
    border: 0;
    border-bottom: 1px solid #ac8fdc;
    padding: 0 0 6px;
    color: #6b60a6;
    border-radius: 0;
    font-size: 16px;
    outline: 0;
    box-shadow: none;

    &:focus {
      outline: 0;
      box-shadow: none;
      border-color: #6b60a6;
    }

    &:-webkit-autofill {
      background: none;
    }
  }

  button {
    transition: background 0.2s ease;
    background-color: #6b60a6;
    color: #fff;
    text-transform: uppercase;
    font-weight: 600;
    margin-top: 50px;
    border: 0;

    &:hover,
    .active.focus,
    .active:focus,
    .focus,
    :active.focus,
    :active:focus,
    :focus {
      background-color: #8981b8;
      color: #fff;
    }
  }
`;

const Links = styled.div`
  margin-top: 70px;
  text-align: center;
`;

const ProfileWrapper = styled.div`
  display: flex;

  img {
    display: block;
    width: 100px;
    height: 100px;
    border-radius: 50px;
  }
`;

const ProfileColumn = styled.div`
  flex: 1;
  padding: 0 20px;
`;

const ColumnTitle = styled.h4`
  text-transform: uppercase;
  font-weight: ${typography.fontWeightMedium};
  border-bottom: 1 px dotted ${colors.colorShadowGray};
  padding-bottom: ${dimensions.unitSpacing};
  font-size: ${typography.fontSizeHeading8}px;
  margin: 0 0 ${dimensions.coreSpacing};
`;

export { AuthBox, Links, ProfileWrapper, ProfileColumn, ColumnTitle };
