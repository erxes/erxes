import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { slideDown } from '../../../common/styles/animations';
import { colors, dimensions } from '../../../common/styles';
import { rgba } from '../../../common/styles/ecolor';
import { FlexCenter } from '../../../common/styles/main';

export const LogoWrapper = styledTS<{ odd?: boolean }>(styled.div)`
  display: flex;
  justify-content: center;
  padding: ${props => (props.odd ? '40px 0 20px' : '20px')};
  height: 273px;

  img {
    height: 113px;
    margin-top: 64px;
  }
`;

export const Settings = styled.div`
  display: flex;
  text-align: right;
  width: 55px;
  height: 56px;
  background: #ff7800;
  border-radius: 10px;
  margin-right: 64px;
  margin-top: 64px;

  i {
    padding: 18px;
    align-items: center;
    display: flex;
  }
`;

export const Footer = styledTS<{ color?: string }>(styled.div)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${props => (props.color ? props.color : colors.colorSecondary)}
  color: ${colors.colorWhite};
  border-radius: 28px 28px 0px 0px;
  padding: 20px 40px;
  text-align: center;
  font-weight: 600;
  text-transform: uppercase;

  span {
    margin-right: 30px;
  }
`;

export const ChooseType = styled.div`
  text-align: center;
  margin-top: 0;

  h4 {
    font-size: 48px;
    font-weight: 600;
  }
`;

export const PortraitViewWrapper = styled.div`
  background: url(images/portrait.svg);
  background-repeat: no-repeat;
  height: 100%;
  position: relative;
  font-size: 34px;

  > img {
    height: 120px;
    animation: ${slideDown} 0.5s linear;
  }
`;

export const Type = styledTS<{ color?: string }>(styled(FlexCenter))`
 border: 1px solid ${props =>
   props.color ? props.color : colors.colorSecondary};
   border-radius: 8px;
   background: ${props =>
     rgba(props.color ? props.color : colors.colorSecondary, 0.08)};
  display: flex;
  flex-direction: column;
  padding: 30px;
  width: 350px;
  height: 250px;
  font-weight: 500;
  font-size: 32px;

  > img {
    width: 150px;
    min-height: 150px;
    margin-bottom: ${dimensions.unitSpacing}px;
  }

   &:first-child {
     margin-right: 30px;
   }
`;

export const AppWrapper = styled.div`
  margin: 60px 0;

  > img {
    width: 500px;
    margin-bottom: 20px;
  }

  .app-download {
    margin-top: 20px;
    width: 150px;

    &:first-child {
      margin-right: 10px;
    }
  }
`;

export const PortraitStage = styled.div`
  padding-right: 50px;
  justify-content: space-between;
  text-align: center;

  > img {
    max-width: 200px;
    max-height: 200px;
    margin-top: 10px;
  }
`;

export const KioskStageContent = styledTS<{
  color?: string;
  innerWidth?: number;
}>(styled.div)`
  display: flex;
  margin: 30px;
  width: 100%;

  /* width */
  ::-webkit-scrollbar {
    height: ${props =>
      props.innerWidth ? `${props.innerWidth * 0.01}px` : '15px'};
  }

  /* Track */
  ::-webkit-scrollbar-track {
    border-radius: 10px;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: ${props => (props.color ? props.color : colors.colorSecondary)};
    border-radius: 40px;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: ${props => (props.color ? props.color : colors.colorSecondary)};
  }
`;

export const SelectedItem = styledTS<{ color?: string }>(styled.div)`
  width: 210px;
  flex-shrink: 0;
  border: 1px solid ${props =>
    props.color ? props.color : colors.colorSecondary};
  box-sizing: border-box;
  border-radius: 16px;
  margin-right: 15px;
  display: flex;
  justify-content: center;
  overflow: hidden;
`;

export const SelectedStage = styled.div`
  min-width: 210px;
  text-align: center;
  position: relative;
  padding: 5px;
  flex: 1;

  i {
    font-size: 20px;
    cursor: pointer;
    margin-right: 10px;
    position: absolute;
    right: 0;
    top: 6px;
  }

  .image-wrapper {
    img {
      width: 90px;
      height: 90px;
    }
  }

  .text-wrapper {
    text-align: center;
    line-height: ${dimensions.coreSpacing + 2}px;
    font-size: ${dimensions.coreSpacing + 2}px;
    padding: ${dimensions.unitSpacing}px 0;

    > div {
      margin-bottom: 5px;
      max-height: 45px;
      overflow: hidden;
    }

    span {
      color: #616e7c;
      font-weight: 600;

      b {
        color: #ff7800;
      }
    }
  }

  .count-wrapper {
    margin-top: 5px;

    button {
      padding: 0px 20px;
      border-radius: 8px;
      background: #fff;
      font-weight: 600;
      border: 1px solid #616e7c;
      color: #616e7c;
      margin-right: 5px;
      cursor: pointer;
    }

    .active {
      border: 1px solid #ff7800;
      color: #ff7800;
    }
  }
`;

export const CloseIcon = styled.div`
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  transition: all ease 0.3s;
  font-size: 14px;
  cursor: pointer;
`;

export const ConfirmListWrapper = styled.div`
  ul {
    list-style: none;
    padding: 0;
    margin-top: 0;

    li {
      border-bottom: 1px solid #ccc;
      padding-bottom: ${dimensions.coreSpacing}px;
      margin-bottom: ${dimensions.coreSpacing}px;
      display: flex;
      align-items: center;

      h4 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 10px;
      }

      .item {
        flex: 1;
      }

      .product-count {
        display: flex;
        justify-content: space-between;
        font-size: 26px;

        b {
          color: ${props =>
            props.color ? props.color : colors.colorSecondary};
        }

        span {
          color: ${colors.colorCoreGray};
        }
      }

      .image-wrapper {
        width: 100px;
        height: 100px;
        overflow: hidden;
        margin-right: 20px;
        flex-shrink: 0;

        > img {
          width: 100%;
          height: 100%;
        }
      }
    }
  }

  .total {
    text-align: right;
    margin-bottom: 25px;

    b {
      margin-left: ${dimensions.unitSpacing}px;

      &:last-child {
        color: ${props => (props.color ? props.color : colors.colorSecondary)};
      }
    }
  }

  button {
    font-size: 24px;
    padding: 20px;
  }
`;

export const FlexColumn = styledTS<{ color?: string; orientation?: string }>(
  styled.div
)`
  display: flex;
  overflow-x: auto;
  max-width: 70%;

  /* width */
  ::-webkit-scrollbar {
    width: 15px;
    height: ${props =>
      props.orientation && props.orientation === 'portrait' && '20px'};
  }

  /* Track */
  ::-webkit-scrollbar-track {
    border-radius: 10px;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: ${props => (props.color ? props.color : colors.colorSecondary)};
    border-radius: 40px;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: ${props => (props.color ? props.color : colors.colorSecondary)};
  }
`;

const style = `
  color: #fff !important;
  background: #616E7C;`;

export const EbarimtButton = styledTS<{
  isPortrait?: boolean;
}>(styled(FlexCenter))`
  justify-content: center;
  margin: ${props => props.isPortrait && '5px 0 30px 0'};
  font-size: 18px;
  padding: 0 5px;
  margin-top: ${dimensions.coreSpacing}px;

  button {
    width: 49%;
    padding: 20px 20px;
    background-color: ${colors.colorWhite};
    border: 1px solid #616E7C;
    color: #616E7C !important;

    &:hover {
      ${style}
    }
  }

  .active {
    ${style}
  }

`;

export const KioskAmount = styledTS<{ color?: string }>(styled.div)`
  border: 1px solid ${props => props.color && props.color};
  border-radius: 8px;
  padding: 10px;
  margin: 20px 0  10px 0;
  font-size: 18px;

  .total-wrapper {
    text-align: center;
    display: flex;
    justify-content: space-between;

    span {
      font-weight: 600;
    }
  }
`;

export const PaymentWrapper = styledTS<{ isPortrait?: boolean }>(styled.div)`
  margin:  ${props => (props.isPortrait ? '30px 20px 20px;' : '10px 0')};
  text-align: center;

  button {
    padding: ${props => (props.isPortrait ? '20px 15px' : '10px 20px')};
    border-radius: 8px;
    font-size: ${props => props.isPortrait && '20px'};
    width: 50%;
  }
`;

export const Title = styled.h2`
  text-align: center;
  margin-bottom: 40px;
`;

export const Header = styled.div`
  margin: 0px 20px 20px;
  @media (max-width: 1600px) and (orientation: landscape) {
    margin: 0px 20px 0px;
  }
`;
