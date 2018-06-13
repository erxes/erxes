import styled from 'styled-components';
import { dimensions, colors, typography } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';

const coreSpace = `${dimensions.coreSpacing}px`;
const unitSpace = `${dimensions.unitSpacing}px`;

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

const ErxesMessagesList = styled.ul`
  display: flex;
  flex-direction: column;
  background-color: #faf9fb;
  overflow: auto;
  padding: 20px;
  margin: 0;
  flex: 1;
  list-style: none;
  background-repeat: repeat;
  background-position: 0 0;

  &.background-1 {
    background-image: url('/images/patterns/bg-1.png');
  }
  &.background-2 {
    background-image: url('/images/patterns/bg-2.png');
  }
  &.background-3 {
    background-image: url('/images/patterns/bg-3.png');
  }
  &.background-4 {
    background-image: url('/images/patterns/bg-4.png');
  }

  li {
    position: relative;
    margin-bottom: 10px;
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
  background-color: ${props =>
    props.state ? colors.colorCoreGreen : colors.colorLightGray};
`;

const WidgetPreviewStyled = styled.div`
  font-family: 'Roboto', sans-serif;
  max-height: 460px;
  width: 340px;
  border-radius: 4px;
  background: ${colors.colorWhite};
  color: ${colors.colorWhite};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 15px 0 ${rgba(colors.colorBlack, 0.14)},
    0 1px 6px 0 ${rgba(colors.colorBlack, 0.06)};
`;

export {
  ErxesMiddle,
  ErxesTopbar,
  ErxesState,
  ErxesMessage,
  ErxesWelcomeMessage,
  ErxesAvatar,
  ErxesDate,
  ErxesMessageSender,
  ErxesFromCustomer,
  ErxesMessagesList,
  FromCustomer,
  StateSpan,
  TopbarButton,
  ErxesStaffName,
  ErxesStaffProfile,
  WidgetPreviewStyled
};
