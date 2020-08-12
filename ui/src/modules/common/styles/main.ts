import { colors, dimensions, typography } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import { Actions } from 'modules/customers/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const FullContent = styledTS<{ center: boolean; align?: boolean }>(styled.div)`
  flex: 1;
  display: flex;
  min-height: 100%;
  justify-content: ${props => props.center && 'center'};
  align-items: ${props => (props.align ? 'flex-start' : 'center')};
`;

const MiddleContent = styledTS<{ transparent?: boolean }>(styled.div)`
  width: 900px;
  height: 100%;
  height: calc(100% - 20px);
  background: ${props => !props.transparent && colors.colorWhite};
  margin: 10px 0;
`;

const BoxRoot = styledTS<{ selected?: boolean }>(styled.div)`
  text-align: center;
  float: left;
  background: ${colors.colorLightBlue};
  box-shadow: ${props =>
    props.selected
      ? `0 10px 20px ${rgba(colors.colorCoreDarkGray, 0.12)}`
      : `0 6px 10px 1px ${rgba(colors.colorCoreGray, 0.08)}`} ;
  margin-right: ${dimensions.coreSpacing}px;
  margin-bottom: ${dimensions.coreSpacing}px;
  border-radius: ${dimensions.unitSpacing / 2 - 1}px;
  transition: all 0.25s ease;
  border: 1px solid
    ${props => (props.selected ? colors.colorSecondary : colors.borderPrimary)};

  > a {
    display: block;
    padding: ${dimensions.coreSpacing}px;
    text-decoration: none;

    &:focus {
      text-decoration: none;
    }
  }

  img {
    width: 83px;
    transition: all 0.5s ease;
  }

  span {
    color: ${colors.colorCoreGray};
    display: block;
    margin-top: ${dimensions.unitSpacing}px;
  }

  &:hover {
    cursor: pointer;
    box-shadow: 0 10px 20px ${rgba(colors.colorCoreDarkGray, 0.12)};

    span {
      font-weight: 500;
    }

    img {
      transform: scale(1.1);
    }
  }

  @media (max-width: 780px) {
    width: 100%;
  }
`;

const InfoWrapper = styled.div`
  padding: 20px 20px 30px 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  ${Actions} {
    padding: 0;
  }
`;

const Links = styled.div`
  margin-top: 5px;

  a {
    color: ${colors.colorCoreLightGray};
    margin-right: 10px;

    &:hover {
      color: ${colors.colorCoreGray};
    }

    i {
      font-size: 14px;
    }
  }
`;

const FormWrapper = styled.div`
  display: flex;

  img {
    display: block;
    width: 100px;
    height: 100px;
    border-radius: 50px;
    background-color: ${colors.colorCoreGray};
  }
`;

const FormColumn = styled.div`
  flex: 1;
  padding-right: 40px;

  &:last-of-type {
    padding: 0;
  }
`;

const ModalFooter = styled.div`
  text-align: right;
  margin-top: 30px;
`;

const CenterContent = styled.div`
  text-align: center;
  margin-top: 10px;
`;

const ActivityContent = styledTS<{ isEmpty: boolean }>(styled.div)`
  position: relative;
  height: ${props => props.isEmpty && '360px'};
`;

const DropIcon = styledTS<{ isOpen: boolean }>(styled.span)`
  font-size: 18px;
  line-height: 22px;

  &:after {
    cursor: pointer;
    content: '\\e9a6';
    font-family: 'erxes';
    float: right;
    transition: all ease 0.3s;
    margin-left: ${dimensions.unitSpacing - 2}px;
    transform: ${props => props.isOpen && `rotate(180deg)`};
  }
`;

const HomeContainer = styled.div`
  width: 320px;
`;

const CloseModal = styled.div`
  position: absolute;
  right: -40px;
  width: 30px;
  height: 30px;
  background: ${rgba(colors.colorBlack, 0.3)};
  line-height: 30px;
  border-radius: 15px;
  text-align: center;
  color: ${colors.colorWhite};

  &:hover {
    background: ${rgba(colors.colorBlack, 0.4)};
    cursor: pointer;
  }

  @media screen and (max-width: 1092px) {
    right: 10px;
    top: 10px;
  }
`;

const DateWrapper = styled.time`
  font-size: 12px;
`;

const ScrollWrapper = styledTS<{ calcHeight?: string }>(styled.div)`
  height: 50vh;
  height: ${props =>
    props.calcHeight
      ? `calc(100vh - ${props.calcHeight}px)`
      : 'calc(100vh - 280px)'};
  overflow: auto;
  padding: 5px 10px 0 20px;
  margin-left: -20px;
  margin-right: -10px;
  margin-top: -5px;
`;

const DateContainer = styled.div`
  .form-control {
    box-shadow: none;
    border-radius: 0;
    border: none;
    background: none;
    border-bottom: 1px solid ${colors.colorShadowGray};
    padding: 5px 0;
    font-size: ${typography.fontSizeBody}px;

    &:focus {
      box-shadow: none;
      border-color: ${colors.colorSecondary};
    }
  }
`;

const TabContent = styled.div`
  margin-top: ${dimensions.coreSpacing}px;
`;

const ButtonRelated = styled.div`
  text-align: center;
  padding: 10px 0 16px;
  font-size: 12px;

  span {
    background: rgba(0, 0, 0, 0.06);
    padding: 4px 16px;
    color: ${colors.colorCoreGray};
    border-radius: 25px;
    transition: all 0.3s ease;

    &:hover {
      cursor: pointer;
      background: rgba(0, 0, 0, 0.1);
      color: ${colors.textSecondary};
    }
  }
`;

const SimpleButton = styledTS<{ isActive?: boolean }>(styled.div)`
  font-size: 15px;
  background: ${props => props.isActive && colors.bgGray};
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  border-radius: 2px;
  transition: background ease 0.3s;

  &:hover {
    background: ${colors.bgActive};
    cursor: pointer;
  }
`;

const TopHeader = styled.div`
  padding: 18px 20px;
`;

const Title = styledTS<{ capitalize?: boolean }>(styled.div)`
  font-size: 24px;
  margin: 20px 0;
  display: flex;
  line-height: 30px;  
  text-transform: ${props => props.capitalize && 'capitalize'};

  > span {
    font-size: 75%;
    color: #666;
    margin-left: 10px;
    margin-top: 2px;
  }
`;

const Count = styled.div`
  font-size: 15px;
  font-weight: bold;
  margin: 10px 20px;
  color: #666;
`;

const Limited = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
`;

export {
  BoxRoot,
  FullContent,
  ModalFooter,
  InfoWrapper,
  Links,
  FormWrapper,
  FormColumn,
  CenterContent,
  ActivityContent,
  DropIcon,
  MiddleContent,
  HomeContainer,
  DateWrapper,
  CloseModal,
  ScrollWrapper,
  DateContainer,
  TabContent,
  ButtonRelated,
  SimpleButton,
  TopHeader,
  Title,
  Count,
  Limited
};
