import styled from 'styled-components';
import { colors, typography, dimensions } from 'modules/common/styles';

const AuthBox = styled.div`
  background-color: ${colors.colorWhite};
  padding: 70px 60px;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 0px 20px 3px;
  border-radius: 2px;

  h2 {
    color: ${colors.colorPrimary};
    font-size: 30px;
    font-weight: 400;
    margin: 0 0 50px;
  }

  input {
    padding: 0 0 6px;
    color: ${colors.colorCoreBlack};
    font-size: 16px;
    outline: 0;

    &:focus {
      outline: 0;
      box-shadow: none;
      border-color: ${colors.colorPrimary};
    }
  }

  button {
    text-transform: uppercase;
    font-weight: 600;
    margin-top: 50px;
    border: 0;
  }
`;

const Links = styled.div`
  margin-top: 50px;
  text-align: center;
`;

const Avatar = styled.div`
  color: ${colors.colorWhite};
  position: relative;

  input[type='file'] {
    display: none;
  }

  .icon {
    visibility: hidden;
    transition: all 0.3s ease-in;
    transition-timing-function: linear;
    padding: 25px 35px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.3);
    position: absolute;
    top: 25px;
  }

  img {
    display: block;
    width: 100px;
    height: 100px;
    border-radius: 50px;
  }

  &:hover {
    .icon {
      visibility: visible;
      cursor: pointer;
    }
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
