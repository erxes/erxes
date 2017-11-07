import styled from 'styled-components';
import { dimensions, colors, typography } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';

const coreSpace = `${dimensions.coreSpacing}px`;
const unitSpace = `${dimensions.unitSpacing}px`;

const ContentBox = styled.div`
  padding: ${coreSpace};
`;

const Margined = styled.div`
  padding: ${coreSpace};
  flex: 1;
  min-height: 100%;
  height: 100%;
`;

const LogoContainer = styled.div`
  color: ${colors.colorWhite};
  line-height: 56px;
  text-align: center;
  border-radius: 28px;
  width: 56px;
  height: 56px;
  cursor: pointer;
  box-shadow: 0 0 ${unitSpace} 0 ${rgba(colors.colorBlack, 0.2)};
  background-color: ${colors.colorPrimary};
  background-position: center;
  background-size: 46px;
  background-repeat: no-repeat;
  margin-top: ${unitSpace};
  position: relative;
  float: right;

  .icon {
    margin: 0;
    visibility: hidden;
    transition: all 0.3s ease-in;
    transition-timing-function: linear;
  }

  &:hover {
    .icon {
      visibility: visible;
    }
  }
`;

const LogoSpan = styled.span`
  position: absolute;
  width: ${coreSpace};
  height: ${coreSpace};
  background: ${colors.colorCoreRed};
  display: block;
  right: -2px;
  top: -5px;
  color: ${colors.colorWhite};
  border-radius: ${unitSpace};
  text-align: center;
  line-height: ${coreSpace};
  font-size: ${unitSpace};
`;

const ColorPick = styled.div`
  border-radius: 4px;
  display: inline-block;
  padding: 5px;
  border: 1px solid ${colors.colorShadowGray};
  cursor: pointer;
`;

const ColorPicker = styled.div`
  width: 80px;
  height: 15px;
`;

const WidgetApperance = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  min-height: 100%;
`;

const WidgetSettings = styled.div`
  padding: 10px 30px 10px 10px;
`;

const WidgetBox = styled.div`
  margin-bottom: ${coreSpace};
`;

const WidgetPreviewStyled = styled.div`
  max-height: 430px;
  width: 280px;
  border-radius: 4px;
  background: ${colors.colorWhite};
  color: ${colors.colorWhite};
  display: flex;
  font-size: ${typography.fontSizeHeading8}px;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 15px 0 ${rgba(colors.colorBlack, 0.14)},
    0 1px 6px 0 ${rgba(colors.colorBlack, 0.06)};
`;

const ErxesTopbar = styled.div`
  overflow: hidden;
  width: 100%;
  position: relative;
  text-align: center;
  flex-shrink: 0;
`;

const TopbarButton = styled.div`
  left: ${unitSpace};
`;

const ErxesMiddle = styled.div`
  display: inline-block;
`;

const ErxesStaffProfile = styled.div`
  padding: ${unitSpace} 0;
  text-align: left;
  line-height: 15px;

  img {
    float: left;
    width: 30px;
    height: 30px;
    border-radius: ${coreSpace};
    overflow: hidden;
  }
`;

const ErxesStaffName = styled.div`
  font-size: ${typography.fontSizeBody}px;
  font-weight: ${typography.fontWeightMedium};
  padding-top: 3px;
  margin-left: 40px;
`;

const ErxesState = styled.div`
  font-size: ${typography.fontSizeUppercase}px;
  font-weight: ${typography.fontWeightLight};
  margin-left: 40px;
`;

const ErxesWelcomeMessage = styled.li`
  padding: 18px;
  border-radius: 4px;
  border: 1px solid ${colors.colorShadowGray};
  background: ${colors.colorWhite};
  color: ${colors.colorCoreGray};
  margin-bottom: ${coreSpace};
`;

const ErxesAvatar = styled.div`
  width: 30px;
  height: 30px;
  border-radius: ${dimensions.headerSpacing}%;
  overflow: hidden;
  position: absolute;
  left: 0;
  bottom: ${coreSpace};

  img {
    width: 100%;
    height: 100%;
  }
`;

const ErxesMessage = styled.div`
  padding: ${unitSpace} 12px;
  background-color: ${colors.borderPrimary};
  border-radius: 4px;
  position: relative;
  margin: 0 ${coreSpace} 5px 40px;
  display: inline-block;
  word-break: break-word;
  color: ${colors.colorCoreGray};
  text-align: left;
`;

const ErxesDate = styled.div`
  font-size: ${unitSpace};
  color: ${colors.colorCoreGray};
  margin-left: 40px;
`;

const ErxesMessageSender = styled.div`
  overflow: hidden;
  font-size: ${typography.fontSizeHeading8}px;
  padding: 17px 30px;
  color: ${colors.colorCoreGray};
  border-top: 1px solid ${colors.colorWhite};
`;

const ErxesFromCustomer = styled.li`
  text-align: right;
`;

const FromCustomer = ErxesMessage.extend`
  margin: 0 0 5px ${coreSpace};
  text-align: right;
  color: ${colors.colorWhite};
`;

const StateSpan = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  display: inline-block;
  margin-bottom: 1px;
  margin-right: 3px;
  background-color: ${colors.colorCoreGreen};
`;

const SubHeading = styled.h4`
  text-transform: uppercase;
  font-weight: ${typography.fontWeightMedium};
  border-bottom: 1 px dotted ${colors.colorShadowGray};
  padding-bottom: ${unitSpace};
  font-size: ${typography.fontSizeHeading8}px;
  margin: 0 0 ${coreSpace};
`;

const MarkdownWrapper = styled.div`
  position: relative;
  background: ${colors.bgLight};
  border: 1px solid ${colors.colorShadowGray};

  > div {
    background: none;
  }

  button {
    position: absolute;
    right: ${coreSpace};
    top: ${coreSpace};
  }

  pre {
    border: none;
    background: none;
  }
`;

const InlineItems = styled.div`
  display: flex;
  margin-bottom: ${unitSpace};
  align-items: center;

  > div {
    margin-right: ${unitSpace};
  }
`;

const SubItem = styled.div`
  margin-bottom: ${coreSpace};
`;

const Well = styled.div`
  min-height: ${coreSpace};
  padding: ${coreSpace};
  margin-bottom: ${coreSpace};
  background-color: ${colors.bgLight};
  border: 1px solid ${colors.colorShadowGray};
`;

export {
  ContentBox,
  SubHeading,
  MarkdownWrapper,
  InlineItems,
  SubItem,
  Well,
  Margined,
  WidgetApperance,
  WidgetPreviewStyled,
  WidgetSettings,
  ErxesMiddle,
  ErxesTopbar,
  ErxesState,
  ErxesMessage,
  ErxesWelcomeMessage,
  ErxesAvatar,
  ErxesDate,
  ErxesMessageSender,
  ErxesFromCustomer,
  FromCustomer,
  StateSpan,
  TopbarButton,
  ErxesStaffName,
  ErxesStaffProfile,
  WidgetBox,
  ColorPick,
  ColorPicker,
  LogoContainer,
  LogoSpan
};
