import { colors, dimensions, typography } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const coreSpace = `${dimensions.coreSpacing}px`;
const unitSpace = `${dimensions.unitSpacing}px`;

const ErxesTopbar = styled.div`
  transition: height 0.25s ease-in-out;
  background-image: url(https://s3.amazonaws.com/erxes/pattern.png);
  background-repeat: repeat;
  background-size: cover;
  position: relative;
  z-index: 10;
  box-shadow: 0 4px 6px 0 ${rgba(colors.colorBlack, 0.1)};

  &:before {
    background: url(https://s3.amazonaws.com/erxes/radial.png) left top
      no-repeat;
    background-size: cover;
    bottom: 0;
    content: '';
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  }
`;

const ErxesMiddle = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-around;
  min-height: 70px;
  width: auto;
  height: auto;
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
    border: 1px solid ${colors.colorWhite};
    margin-left: -10px;
    overflow: hidden;
  }
`;

const ErxesStaffName = styled.div`
  font-size: ${typography.fontSizeBody}px;
  font-weight: ${typography.fontWeightMedium};
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-top: 3px;
  margin-left: 43px;
`;

const ErxesState = styled.div`
  font-size: ${typography.fontSizeUppercase}px;
  font-weight: ${typography.fontWeightLight};
  margin-left: 43px;
`;

const ErxesSpacialMessage = styled.li`
  background-color: ${colors.colorShadowGray};
  border-radius: 10px;
  box-shadow: 0 1px 1px 0 ${rgba(colors.colorBlack, 0.2)};
  color: ${colors.textSecondary};
  margin-bottom: ${coreSpace};
  padding: ${coreSpace};
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

const StateSpan = styledTS<{ state: boolean }>(styled.span)`
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
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 720px;
  width: 380px;
  border-radius: ${dimensions.unitSpacing}px;
  border-bottom-right-radius: 25px;
  background: ${colors.colorWhite};
  color: ${colors.colorWhite};
  box-shadow: 0 2px 16px 1px ${rgba(colors.colorBlack, 0.2)};
`;

export {
  ErxesMiddle,
  ErxesTopbar,
  ErxesState,
  ErxesMessage,
  ErxesSpacialMessage,
  ErxesAvatar,
  ErxesDate,
  ErxesMessageSender,
  ErxesFromCustomer,
  ErxesMessagesList,
  FromCustomer,
  StateSpan,
  ErxesStaffName,
  ErxesStaffProfile,
  WidgetPreviewStyled
};
