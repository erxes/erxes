import { colors, dimensions, typography } from '../styles';

import { getThemeItem } from '../utils';
import { rgba } from '../styles/ecolor';
import styled from 'styled-components';

const thBackground = getThemeItem('background');

const AuthBox = styled.div`
  width: 100%;
  background-color: ${colors.colorWhite};
  padding: 20%;
  border-radius: 2px;
  max-height: 700px;
  overflow: auto;

  img {
    width: 100px;
    margin-bottom: 56px;
  }

  h2 {
    color: ${thBackground || colors.colorPrimary};
    font-size: 30px;
    font-weight: 800;
    margin: 0 0 10px;
  }
  
  p {
    color: ${colors.colorCoreBlueGray};
    font-size: 14px;
  }

  form {
    margin-top: ${dimensions.unitSpacing + dimensions.coreSpacing}px;

    div > label {
      font-size: 13px;
      color: #2D3748;
    }

    input {
      padding: 1.75em 1em;
      color: ${colors.colorCoreBlack};
      font-size: 14px;
      outline: 0;
      border-radius: 15px;
      border: 1px solid #E2E8F0;

      &::placeholder {
        color: ${rgba(colors.colorCoreBlueGray, 0.8)}
      }
    }
  }

  button {
    text-transform: capitalize;
    font-weight: 600;
    font-size: 16px;
    padding: 15px ${dimensions.coreSpacing}px;
    margin: 25px 0px;
    border-radius: 8px;
    box-shadow: 0px 12px 24px rgba(0, 0, 0, 0.24);
    border: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${thBackground || colors.colorPrimaryDark}

    &:hover {
      background-color: ${thBackground || colors.colorPrimaryDark}
    }
  }
  
  a {
    display: block;
    text-align: center;
    color: ${colors.colorCoreBlueGray};
    font-size: 14px;
    transition: all ease .3s;

    &:hover {
      color: ${colors.colorSecondary};
    }
  }

  @media (max-width: 768px) {
    padding: ${dimensions.coreSpacing * 2}px;
  }
`;

const SignUpBox = styled.div`
  button {
    text-transform: capitalize;
    font-weight: 600;
    font-size: 18px;
    padding: 1em 0;
    margin-top: 25px;
    background-color: ${colors.colorWhite};
    box-shadow: none;
    border-radius: 8px;
    border: 1px solid ${colors.borderDarker};
    color: rgba(0, 0, 0, 0.62) !important;

    &:hover {
      background-color: ${colors.borderDarker};
    }
  }

  p {
    display: block;
    text-align: center;
    padding: 1em 0;

    a {
      margin-left: 0.5em;
      display: inline-block;
      color: ${colors.colorPrimaryDark};
      font-weight: 700;
    }
  }
`;

const Seperator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.75em 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid ${colors.borderPrimary};
  }

  &:not(:empty)::before {
    margin-right: 0.5em;
  }

  &:not(:empty)::after {
    margin-left: 0.5em;
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

export { AuthBox, SignUpBox, Seperator, ColumnTitle };
