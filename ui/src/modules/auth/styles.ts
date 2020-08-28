import { colors, dimensions, typography } from 'modules/common/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const AuthBox = styledTS<{ type?: string }>(styled.div)`
  background-color: ${colors.colorWhite};
  padding: 70px 60px;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 0px 20px 3px;
  border-radius: 2px;

  h2 {
    color: ${colors.colorPrimary};
    font-size: ${props => (props.type === 'setup' ? '27px' : '30px')};
    font-weight: 400;
    margin: ${props => (props.type === 'setup' ? '0 0 15px' : '0 0 50px')};
  }

  p {
    margin: 0 0 10px;
    font-size: 13px;
  }

  form>div {
    margin-bottom: ${props => (props.type === 'setup' ? '15px' : '20px')};
  }

  input {
    padding: 0 0 6px;
    color: ${colors.colorCoreBlack};
    font-size: ${props => (props.type === 'setup' ? '14px' : '16px')};
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

  @media (max-width: 768px) {
    padding: ${dimensions.coreSpacing * 2}px;
  }
`;

const Links = styled.div`
  margin-top: 50px;
  text-align: center;
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

export { AuthBox, Links, ProfileWrapper, ProfileColumn, ColumnTitle };
