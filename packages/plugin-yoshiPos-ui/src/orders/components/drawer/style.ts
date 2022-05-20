import styledTS from 'styled-components-ts';
import styled from 'styled-components';
import { colors, dimensions } from '../../../common/styles';

export const TypeWrapper = styledTS<{ isPortrait?: boolean }>(styled.div)`
  margin-top: ${props => (props.isPortrait ? '50px' : '20px')};
  text-align: center;

  h2 {
    margin-bottom:  ${props => (props.isPortrait ? '20px' : '')};
    font-size: ${props => props.isPortrait && '34px'};

    b {
      margin-left: 5px;
      color: #FF7800;
    }

    @media (max-width: 1250px) and (orientation:landscape) {
      font-size: 25px;
    }
  }

  h4 {
    text-transform: uppercase;
    font-weight: 600;
  }
`;

export const Cards = styledTS<{ color?: string; isPortrait?: boolean }>(
  styled.div
)`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  p {
    color: ${props => props.color && props.color};
    font-size: ${props => (props.isPortrait ? '35px' : '18px')};
    font-weight: 500;
    @media (max-width: 1250px) and (orientation:landscape) {
      line-height: 22px;
      font-size: 16px;
    }
  }

  .activeCard {
    border: 1px solid ${props =>
      props.color ? props.color : colors.colorSecondary};
  }
`;

export const Card = styledTS<{ isPortrait?: boolean }>(styled.div)`
  border: 1px solid ${colors.borderPrimary};
  border-radius: 16px;
  padding: ${dimensions.coreSpacing}px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: ${props => (props.isPortrait ? '46%' : '32%')};
  margin: 0 10px 20px 0;
  flex-shrink: 0;
  cursor: pointer;
  transition: all ease 0.3s;

  > div {
    display: flex;
    align-items: center;
    justify-content: center;

    > img {
      max-height: ${props => (props.isPortrait ? '250px' : '120px')};
      max-width: ${props => (props.isPortrait ? '250px' : '120px')};

      @media (max-width: 1250px) and (orientation:landscape) {
        max-height: 80px;
        max-width: 80px;
      }
    }
  }

  &:hover {
    box-shadow: 0 6px 10px 1px rgba(136, 136, 136, 0.08);
  }

  &:nth-child(3) {
    margin-right: 0;
  }
`;

export const VatWrapper = styledTS<{ color?: string; isPortrait?: boolean }>(
  styled.div
)`
  button {
    font-size: 22px;
  }

  input {
    font-size: 28px;
  }
`;

export const SuccessfulText = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  .icon-wrapper {
    background: ${colors.colorCoreGreen};
    border-radius: 50%;
    width: 50px;
    height: 50px;
    line-height: 50px;
    text-align: center;
    margin-right: ${dimensions.unitSpacing}px;

    &.small {
      width: 30px;
      height: 30px;
      line-height: 30px;
    }

    > i {
      color: ${colors.colorWhite};
    }
  }

  h4 {
    margin: 0;
  }
`;
