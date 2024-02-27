import { colors, dimensions, typography } from 'modules/common/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const AuthBox = styledTS<{ backgroundColor?: string }>(styled.div)`
  width: 100%;
  background-color: ${colors.colorWhite};
  padding: 30px 40px;
  border-radius: 2px;
  max-height: 700px;
  overflow: auto;

  > img {
    width: 100px;
    margin-bottom: ${dimensions.unitSpacing + dimensions.coreSpacing}px;
  }

  h2 {
    color: ${(props) => props.backgroundColor || colors.colorPrimary};
    font-size: 24px;
    font-weight: 800;
    margin: 0 0 10px;
  }
  
  > span {
    color: #666;
    font-size: 14px;
    margin-bottom: ${dimensions.unitSpacing}px;
    display: block;
  }

  p {
    color: #666;
    font-size: 16px;
  }

  input {
    padding: 1.75em 1em;
    color: ${colors.colorCoreBlack};
    font-size: 14px;
    outline: 0;
    border-radius: 8px;
    background-color: ${colors.bgLight}
    border: 1.1px solid ${colors.bgLight}

    &:focus {
      outline: 0;
      box-shadow: none;
      border: 1.1px solid ${colors.borderDarker}
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

  > a {
    display: block;
    text-align: center;
    color: ${colors.colorCoreSunYellow}
    font-size: 13px;
    transition: all ease .3s;

    &:hover {
      font-weight: 500;
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

const AuthButton = styled.div`
  height: 50px;
  width: 100%;
  line-height: 30px;
  text-align: center;
  font-weight: 600;
  border: 1px solid ${colors.borderPrimary};
  cursor: pointer;
  transition: all ease 0.3s;
  border-radius: ${dimensions.unitSpacing - 2}px;
  padding: 5px 25px;

  &.google {
    background-color: ${colors.colorWhite};
    display: flex;
    justify-content: center;
    align-items: center;

    > img {
      width: ${dimensions.coreSpacing}px;
      margin-right: ${dimensions.unitSpacing}px;
    }
  }

  a {
    color: ${colors.textPrimary};
  }

  &:hover {
    border-color: #dcdcdc;
  }
`;

export { AuthBox, SignUpBox, Seperator, ColumnTitle, AuthButton };
