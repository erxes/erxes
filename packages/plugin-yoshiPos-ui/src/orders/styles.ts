import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';
import { dimensions, colors } from '../common/styles';
import { darken, rgba } from '../common/styles/ecolor';
import { FlexBetween, SimpleButton } from '../common/styles/main';

export const PosWrapper = styled.div`
  position: relative;

  .headerKiosk {
    position: relative;
    height: 200px;
  }

  @media (max-width: 1170px) and (orientation: landscape) {
    .no-padding {
      padding: 0;
    }
  }
`;

export const FlexCustomer = styled.div`
  display: flex;
  align-items: center;
`;

export const BackButton = styled.div`
  height: 32px;
  display: flex;
  align-items: center;
  font-weight: 500;
  cursor: pointer;
  margin-right: ${dimensions.coreSpacing}px;
`;

export const CalculationHeader = styled(FlexCustomer)`
  justify-content: space-between;
  margin-top: ${dimensions.unitSpacing + 3}px;

  > div {
    flex: 1;
    padding: 10px 5px;

    &:first-child {
      margin-right: ${dimensions.unitSpacing}px;
    }
  }
`;

export const Column = styled.div`
  border: 1px solid #ddd;
`;

export const StageItems = styledTS<{
  heigth?: number;
  color?: string;
  innerWidth?: number;
}>(styled.div)`
  overflow: auto;
  height: calc(100vh - 280px);
  margin-bottom: 5px;

  /* width */
  ::-webkit-scrollbar {
    width: ${props =>
      props.innerWidth ? `${props.innerWidth * 0.01}px` : '6px'}
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
    background: ${props =>
      props.color ? props.color : colors.colorSecondary};;
  }
`;

export const MainContent = styledTS<{
  hasBackground?: boolean;
  numPadding?: boolean;
  hasShadow?: boolean;
  isHalf?: boolean;
}>(styled.div)`
  padding: ${props => (props.numPadding ? '20px 0px 20px 0' : '20px')};
  background: ${props => props.hasBackground && colors.colorWhite};
  box-shadow: ${props =>
    props.hasShadow && 'rgb(217, 226, 236) 0px 0px 24px 0px;'};
  height: ${props => (props.isHalf ? '' : '100vh;')};

  @media (max-width: 1170px) and (orientation:landscape) {
    padding: ${props => (props.numPadding ? '15px 0;' : '15px 10px')};
  }
`;

export const MenuContent = styledTS<{ hasItems?: boolean }>(styled.div)`
  height: 100%;
  overflow: auto;
  padding: 20px;
  justify-content: center;
  max-height: ${props => props.hasItems && 'calc(100% - 300px)'};

  button {
    font-size: 22px;
    margin-bottom: ${dimensions.coreSpacing}px;
  }
`;

export const PosMenuContent = styled.div`
  height: 100%;
  justify-content: center;

  img {
    width: 50px;
  }
`;

export const ProductsContent = styledTS<{ show?: boolean }>(styled.div)`
  display: flex;
  flex-direction: column;
  padding: 20px 20px 0 20px;
  height: 100%;
  background-color: ${colors.colorWhite};
  border-radius: 16px;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.10);
`;

export const ScreenContent = styledTS<{
  hasBackground?: boolean;
}>(styled.div)`
  padding: 15px 25px 0 25px;
  background: ${props => props.hasBackground && colors.colorWhite};
  box-shadow: rgb(217, 226, 236) 0px 0px 24px 0px;
  height: 100vh;
`;

export const ProductCategories = styledTS<{ isPortrait?: boolean }>(styled.div)`
  margin: ${props => (props.isPortrait ? '' : '30px 0')};
  width: ${props => (props.isPortrait ? '' : '50%')};
  display: ${props => (props.isPortrait ? 'grid' : '')};
  justify-content: center;

  @media (max-width: 1170px) and (orientation: landscape) {
    margin: 20px 0 10px 0;
  }
`;

//Kiosk
export const KioskMainContent = styledTS<{ hasItems?: boolean }>(styled.div)`
  width: 100%;
  height: calc(100% - 200px);
  display: flex;
`;

export const KioskMenuContent = styled.div`
  width: 20%;
  margin: 0 15px 0 10px;
`;

export const KioskProductsContent = styled.div`
  width: 80%;
  margin-top: 20px;
`;

export const FooterContent = styled.div`
  position: relative;
  width: 100%;
`;

/********end kiosk***** */
export const ProductsWrapper = styledTS<{
  height?: number;
  color?: string;
  innerWidth?: number;
  hasItems?: boolean;
}>(styled.div)`
  display: flex;
  flex-wrap: wrap;
  max-height: calc(100vh - 170px);
  overflow: auto;

  /* width */
  ::-webkit-scrollbar {
    width: 30px;
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
    background: ${props =>
      props.color ? props.color : colors.colorSecondary};;
  }

  @media (orientation: portrait) {
    max-height: ${props => (props.hasItems ? 'calc(100% - 300px)' : '100%')};
  }
`;

export const CategoriesColumn = styled.div`
  @media (max-width: 1170px) and (orientation: landscape) {
    max-height: 450px;
  }
`;

export const ProductCategory = styledTS<{
  isActive?: boolean;
  color?: string;
  isPortrait?: boolean;
  isKiosk?: boolean;
}>(styled.div)`
  border-radius: 16px;
  box-shadow: ${props =>
    props.isPortrait ? '2px 2px 4px rgba(0, 0, 0, 0.25)' : ''};
  margin: ${props => (props.isPortrait ? '0 0px 15px 0' : '10px 0 0 0')};
  padding: ${props => (props.isPortrait ? '' : `5px`)};
  background: ${props => (props.isActive ? '#fff' : '')};
  cursor: pointer;
  border: ${props =>
    props.isActive
      ? props.isPortrait
        ? ''
        : `1px solid ${props.color ? props.color : colors.colorSecondary}`
      : ''};
  color: ${props => props.isActive && props.color};
  transition: all ease .3s;
  overflow: hidden;

  .text-wrapper {
    font-size: 16px;
    line-height:24px;
    letter: 0.15 px
  }

  > div > span {
    color: ${props =>
      props.isActive
        ? props.color
          ? props.color
          : colors.colorSecondary
        : colors.textPrimary};
    font-weight: ${props => (props.isActive ? '600' : '500')};
    font-size: 12px;
  }

  ${props =>
    props.isKiosk &&
    css`
      width: 100%;
      padding: 15px;
      margin-bottom: 20px;
      background: ${props =>
        props.isActive &&
        rgba(props.color ? props.color : colors.colorSecondary, 0.15)};

      > div {
        span {
          font-size: 25px;
        }
      }
    `}
`;

export const CategoryName = styledTS<{ color?: string; isKiosk?: boolean }>(
  styled.div
)`
  display: flex;
  align-items: center;
  justify-content: center;

  ${props =>
    props.isKiosk &&
    css`
      flex-direction: column;
      text-align: center;

      span {
        padding: 0 10px 0 10px;
        font-size: 24px;
        line-height: 25px;
      }
    `}
`;

export const CategoryImage = styledTS<{ isKiosk?: boolean }>(styled.div)`
  width: 32px;
  height: 32px;
  margin-right: ${dimensions.unitSpacing - 5}px;

  img {
    max-width: 100%;
    max-height: 100%;
    border-radius: 5px;
  }

  ${props =>
    props.isKiosk &&
    css`
      width: 100px;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: ${dimensions.coreSpacing - 5}px;
      margin-right: 0;
    `}
`;

export const EmptyContentWrapper = styled.div`
  height: 100%;
  flex: 1;
`;

export const CategoryItemWrapper = styledTS<{ color?: string }>(styled.div)`
  display: flex;
  position: relative;
  cursor: pointer;

  &:hover ${ProductCategory} span {
    color: ${props => (props.color ? props.color : colors.colorSecondary)};
  }
`;

export const Lines = styledTS<{ isActive?: boolean; color?: string }>(
  styled.div
)`
  display: flex;
  align-items: center;
  margin-top: 10px;

  ::after {
    content: '';
    position: absolute;
    margin: auto;
    height: 1px;
    width: 80%;
    background: ${props =>
      props.isActive
        ? props.color
          ? props.color
          : colors.colorSecondary
        : ''};
  }
`;

export const LeftCircle = styledTS<{ isActive?: boolean; color?: string }>(
  styled.div
)`
  display: flex;
  align-items: center;
  margin: 10px 0 0 3px;

  &:before {
    content: '';
    width: ${dimensions.unitSpacing - 2}px;
    height: ${dimensions.unitSpacing - 2}px;
    flex-shrink: 0;
    border-radius: 50%;
    border: ${props =>
      props.isActive
        ? `1px solid ${props.color ? props.color : colors.colorSecondary}`
        : ''};
  }
`;

export const Item = styledTS<{
  isPortrait: boolean;
  isActive?: boolean;
  isKiosk?: boolean;
  color?: string;
}>(styled.div)`
  box-shadow: ${props =>
    props.isPortrait ? '' : '0px 2px 4px rgba(0, 0, 0, 0.1)'};
  border-radius: 24px;
  background: ${props => (props.isPortrait ? '' : `${colors.colorWhite}`)};
  display: ${props => (props.isPortrait ? '' : 'flex')};
  align-items: center;
  cursor: pointer;
  margin: 0 20px 20px 0;
  padding: ${dimensions.unitSpacing}px;
  height: 100%;
  position: relative;
  overflow: hidden;
  transition: all ease 0.3s;

  .image-wrapper {
    width: 35%;
    max-height: ${props => (props.isPortrait ? '170px' : '120px')};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-right: 5px;

    > img {
      max-width: 100%;
      max-height: 100%;
      border-radius: 5px;
    }

    ${props =>
      props.isKiosk &&
      css`
        width: 70%;
        margin: 0 auto;
        height: 170px;
      `}

    @media (max-width: 1200px) and (orientation:landscape) {
      width: 60px;
      max-height: 80px;
    }
  }

  .text-wrapper {
    padding: 0 ${dimensions.unitSpacing}px;

    h4 {
      font-size: 14px;
      margin: 0 0 ${dimensions.coreSpacing}px;
      line-height: 18px;
      font-weight: bold;
      word-break: break-word;
    }

    span {
      color: ${props => (props.color ? props.color : colors.colorSecondary)};
      font-size: 15px;
      font-weight: bold;
      position: absolute;
      bottom: ${dimensions.unitSpacing}px;
      word-break: break-word;
    }

    @media (max-width: 1200px) and (orientation:landscape) {
      padding: 5px;

      h4 {
      font-size: 12px;
      line-height: 15px;
      }

      span {
        font-size: 12px;
      }
    }
  }

  .text-kiosk {
    background: #F3F3F3;
    border-radius: 8px;
    text-align: center;
    position: relative;
    padding: ${dimensions.unitSpacing}px;
    height: calc(100% - 170px);

    h4 {
      font-size: 24px;
      letter-spacing: 0.15px;
      margin: 0 0 40px 0;
      font-weight: bold;
      height: 80%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${props =>
        props.isPortrait && props.isActive ? '#1F2933' : '#616E7C;'};
    }

    span {
      color: ${props => (props.color ? props.color : colors.colorSecondary)};
      font-size: 24px;
      font-weight: bold;
      position: absolute;
      bottom: ${dimensions.unitSpacing}px;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  p {
    line-height: 16px;
    font-size: 12px;
    color: #888;
    margin: 0;
  }

  &:hover {
    box-shadow: ${props =>
      props.isPortrait ? '' : '0px 3px 4px rgba(0, 0, 0, 0.12);'};
  }
`;

export const ItemWrapper = styled.div`
  width: 33.3333%;
  margin-bottom: ${dimensions.coreSpacing}px;

  &:nth-child(3n) {
    ${Item} {
      margin-right: ${dimensions.unitSpacing - 5}px;
    }
  }
`;

export const FinderButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

export const ProductLabel = styledTS<{ color?: string; isPortrait?: boolean }>(
  styled.div
)`
  background: ${props => (props.color ? props.color : colors.colorSecondary)}
  color: ${colors.colorWhite};
  padding: 10px;
  margin-top: 10px;
  border-radius: 8px;
  font-size: ${props => (props.isPortrait ? '24px' : '12px')};
  text-align: center;
  font-weight: 500;
  cursor: pointer;
  display: block;
`;

export const Types = styled.div`
  display: flex;
  justify-content: space-between;

  button {
    width: 50%;
    padding: 15px 10px;
    border-radius: 8px;

    span {
      font-size: 18px;

      @media (max-width: 1200px) and (orientation: landscape) {
        font-size: 12px;
      }
    }
  }
`;

export const ToggleButton = styled(SimpleButton)`
  margin-right: 10px;

  .active {
    background: #ccc;
  }
`;

export const Type = styledTS<{ checked?: boolean; color?: string }>(styled.div)`
 border: 1px solid ${props => (props.checked ? props.color : '#cbd2d9')};
 font-weight: ${props => (props.checked ? 'bold' : '')};
 cursor: pointer;
 padding: 10px;
 width: 49%;
 word-break: break-word;
 display: flex;
 align-items: center;
 justify-content: center;
 text-align: center;
 margin: 10px 0;
 line-height: 15px;
 border-radius: 8px;
 transition: all ease .3s;
`;

export const StageContent = styledTS<{ odd?: boolean }>(styled.div)`
  height: ${props => props.odd && '100%'};

  @media (max-heigth: 768px) {
    overflow: auto
  }
`;

export const SettingsButtons = styledTS<{ odd?: boolean }>(styled.div)`
  button {
    margin-bottom: ${dimensions.unitSpacing}px;
  }
`;

export const Drawer = styledTS<{ show: boolean }>(styled.div)`
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  transition: all ease .3s;
  display: ${props => !props.show && 'none'};

  > div {
    height: 100%;
    width: 40%;
  }
`;

export const LeftMenuContainer = styled.div`
  position: relative;
  background: ${colors.bgLight};
  white-space: normal;
  display: flex;
  width: 1080px;
  height: 1320px;
  border-radius: 32px;
  margin-top: 204px;

  flex-direction: column;
  box-shadow: 0 12px 24px -6px rgba(9, 30, 66, 0.25),
    0 0 0 1px rgba(9, 30, 66, 0.08);
`;

export const DrawerContent = styledTS<{
  options?: any;
  color?: string;
  innerWidth?: number;
}>(styled.div)`
  padding: 20px;
  height: 100%;
  overflow: auto;

  /* width */
  ::-webkit-scrollbar {
    width: ${props => (props.innerWidth ? `${props.innerWidth * 0.02}px` : '')}
  }

  /* Track */
  ::-webkit-scrollbar-track {
    border-radius: 10px;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: ${props =>
      props.options ? props.options.colors.secondary : colors.colorSecondary};
    border-radius: 40px;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: ${props =>
      props.options ? props.options.colors.secondary : colors.colorSecondary};
  }

  .ioevLe:checked + span:before, .react-toggle--checked .react-toggle-track {
    background-color: ${props =>
      props.options && props.options.colors.primary} !important;
  }

  .react-toggle--checked .react-toggle-thumb, .react-toggle--checked:hover:not(.react-toggle--disabled) .react-toggle-track {
    border-color: ${props =>
      props.options && props.options.colors.primary} !important;
  }
`;

/**
 * Order search components shown in drawer
 */

export const OrderBoxItem = styled.div`
  width: 33.33333%;
`;

export const OrderBox = styledTS<{
  color?: string;
  isPortrait: boolean;
  type?: string;
}>(styled.div)`
  background: #fff;
  padding: 5px;
  text-align: center;
  margin: 0 15px 15px 0;
  border: 1px solid ;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  cursor: pointer;
  border-color: ${props => (props.color ? props.color : '#ddd')};

  div {
    margin-top: 10px;
    margin-bottom: 10px;
    font-weight: 500;
    font-size: 15px;
    justify-content: space-between;

    span {
      font-size: 11px;
      text-transform: uppercase;
      color: #686868;
    }

    b {
      margin-left: 2px;
      color: #616E7C;
      word-break: break-word;
      line-height: 15px;
      font-size: ${props => (props.isPortrait ? '11px' : '16px')};

      @media (max-width: 1200px) and (orientation: landscape) {
        font-size: 11px;
      }
    }
  }

  a {
    color: #444;
  }

  label {
    color: ${props =>
      props.type === 'Take'
        ? props.color
          ? props.color
          : colors.colorSecondary
        : '#00124E'};
    padding: 2px 6px;
    font-size: 11px;
    border-radius: 20px;
    border: 1px solid ${props =>
      props.type === 'Take'
        ? props.color
          ? props.color
          : colors.colorSecondary
        : '#00124E'};
  }

  &:nth-child(3n) {
    margin-right: 0;
  }
`;

export const Orders = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 20px;
  overflow: auto;
`;

export const SearchInputWrapper = styledTS<{
  active?: boolean;
  full?: boolean;
}>(styled.div)`
  background-color: ${props =>
    props.active ? colors.colorWhite : colors.bgMain};
  border: 1px solid ${props =>
    props.active ? colors.borderDarker : colors.bgMain};
  border-radius: 35px;
  height: 32px;
  position: relative;
  transition: .3s all;
  width: ${props =>
    props.active
      ? props.full
        ? '100%'
        : '280px'
      : props.full
      ? '100%'
      : '120px'};
  display: flex;
  padding: 0 ${dimensions.unitSpacing}px;
  align-items: center;

  > span {
    color: ${colors.colorCoreGray};
    padding-left: ${dimensions.unitSpacing}px;
  }

  i {
    cursor: pointer;
    color: ${colors.colorCoreDarkGray};
  }

  input {
    background: 0 0;
    border: none;
    padding: 5px ${dimensions.unitSpacing}px;
    flex: 1;
    height: 100%;
    outline: 0;

    &:focus {
      outline: 0;
    }
  }
`;

export const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;

  > label {
    margin-bottom: 5px;
  }
`;

export const CardInputColumn = styled(FlexColumn)`
  align-items: end;
  align-self: flex-start;
  text-align: center;
`;

export const FormHead = styledTS<{ isPortrait?: boolean }>(styled.div)`
  font-size: ${props => props.isPortrait && '30px'};

  label {
    font-size: ${props => props.isPortrait && '24px'};

    > span {
      font-size: ${props => props.isPortrait && '30px'};

      &:before {
        height: ${props => props.isPortrait && '30px'};
    width: ${props => props.isPortrait && '30px'};
      }
    }
  }

  input {
    height: ${props => props.isPortrait && '60px'} !important;
    font-size: ${props => props.isPortrait && '27px'} !important;
  }

  .icon-cancel {
    font-size: ${props => props.isPortrait && '20px'};
  }

  button {
    font-size: ${props => props.isPortrait && '28px'};
  }

  .react-toggle-track {
    height: ${props => props.isPortrait && '40px'};
    width: ${props => props.isPortrait && '90px'};
  }

  .react-toggle--checked .react-toggle-thumb {
    left: ${props => props.isPortrait && '50px'};
  }

  .react-toggle-thumb {
    height: ${props => props.isPortrait && '40px'};
    width: ${props => props.isPortrait && '40px'};
  }

  .jbyscQ {
    margin-bottom: 5px;
  }
`;

export const Input = styledTS<{ color?: string; setBill?: string }>(styled.div)`
  display: flex;
  align-items: center;
  width: ${props => (props.setBill ? '500px' : '150px')};

  border: ${props => (props.setBill ? '1px solid #ff7800' : '1px solid #ddd')};
  border-radius: 8px;
  padding: 3px 10px;
  flex: 1;
  margin-top: 5px;
  margin-left: 5px;

  input {
    border: 0;
    font-size: 14px;
    display: block;
    width: 100%;
    height: 34px;
    padding: 10px 0;
    color: #444;
    background: none;
    transition: all 0.3s ease;

    &:focus {
      outline: 0;
    }
  }

  @media (max-width: 1250px) and (orientation: landscape){
    width: ${props => (props.setBill ? '320px' : '')};
  }

  > div {
    cursor: pointer;
    margin-left: 10px;

    &:hover {
      i {
        color: ${props => props.color && props.color}
      }
    }
  }
`;

export const FlexHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const LogoSection = styledTS<{ color?: string }>(styled.div)`
  .syncMenu {
    display: flex;
    align-items: center;
    margin: ${dimensions.unitSpacing}px 0 30px;

    > a {
      margin-right: 5px;
    }

    i {
      color: ${props => (props.color ? props.color : colors.colorSecondary)};
      line-height: ${dimensions.coreSpacing + dimensions.unitSpacing}px;
      padding-right: ${dimensions.unitSpacing}px;
      cursor: pointer;
    }
  }
`;

export const ProductSearch = styled.div`
  width: 50%;
  display: flex;
  align-items: center;
`;

export const PackageProduct = styled.span`
  text-decoration: underline;
  text-decoration-color: greenyellow;
  text-decoration-style: wavy;
`;

export const Divider = styled.div`
  border-bottom: 1px dotted ${darken(colors.borderDarker, 5)};
  padding-bottom: ${dimensions.coreSpacing}px;
  margin: 0 0 ${dimensions.coreSpacing}px 0;

  @media (max-width: 1170px) {
    margin-left: ${dimensions.coreSpacing}px;
  }
`;

export const MarginTop = styledTS<{ margin: number }>(styled.div)`
  margin-top: ${props => props.margin}px
`;

export const PaymentInfo = styledTS<{ color?: string }>(styled.div)`
  border: 1px solid ${props =>
    props.color ? props.color : colors.colorSecondary};
  border-radius: 8px;
  padding: ${dimensions.unitSpacing}px;
  margin-bottom: ${dimensions.unitSpacing}px;
  font-size: 12px;

  .middle {
    margin: ${dimensions.unitSpacing}px 0;
    flex-direction: column;
  }

  > div, .middle > div {
    display: flex;
    justify-content: space-between;
    flex: 1;

    > span b {
      color: ${props => (props.color ? props.color : colors.colorSecondary)};
    }
  }
`;

export const Amount = styledTS<{ isPortrait?: boolean; color?: string }>(
  styled(FlexBetween)
)`
  border: 1px solid ${props =>
    props.color ? props.color : colors.colorSecondary};
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  font-weight: ${props => (props.isPortrait ? '300' : '600')}
  color: ${props => (props.color ? props.color : colors.colorSecondary)};
  height: ${props => (props.isPortrait ? ' 115px' : '')}
  display: ${props => (props.isPortrait ? ' block' : '')};
  margin-top: ${props => (props.isPortrait ? ' 20px' : '')};

  .payment-wrapper {
    display: flex;
    justify-content: space-between;
    font-size: 18px;
    height: 120px;
    flex-direction: column;

    span {
      font-weight: 600;
    }
  }

  .amount-wrapper {
    text-align: left;
    font-weight: 300;

    ul.a {
      list-style-type: none;
      margin: 0;
      padding: 5px;
      li:nth-child(1) {
        color: #904300;
        font-weight: 500;
      }
      li:nth-child(6) {
        color: #904300;
        font-weight: 500;
      }
    }

  }
`;

export const EntityChecker = styled.div`
  display: flex;
`;

export const ButtonGroup = styled.div`
  margin-left: 20px;
  height: 50px;
  display: flex;
  align-items: center;
`;
