import { colors, dimensions } from '../styles';
import styled from 'styled-components';

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
  p {
    color: #666;
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
  @media (max-width: 768px) {
    padding: ${dimensions.coreSpacing * 2}px;
  }
`;


export { AuthBox };