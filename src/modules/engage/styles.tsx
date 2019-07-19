import { colors, dimensions } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import { BoxRoot } from 'modules/common/styles/main';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import {
  Launcher,
  WidgetPreviewStyled
} from '../settings/integrations/components/messenger/widgetPreview/styles';

const coreSpace = `${dimensions.coreSpacing}px`;
const size = 65;

const EngageTitle = styled.div`
  &:hover {
    text-decoration: underline;
    color: ${colors.colorBlack};
    cursor: pointer;
  }
`;

const HelperText = styled.div`
  color: ${colors.colorCoreGray};
  font-size: 12px;
`;

const EngageBox = styled.div`
  padding: ${coreSpace} ${coreSpace} 0;
`;

const FormWrapper = styled.div`
  padding: ${coreSpace};
  flex: 1;
  min-height: 100%;
  height: 100%;
`;

const PreviewContent = styledTS<{ isFullmessage: boolean }>(styled.div)`
  padding: 0 ${coreSpace};
  line-height: 22px;
  margin-bottom: ${coreSpace};
  color: ${colors.colorCoreGray};
  font-size: 14px;
  word-break: break-word;

  ${props => {
    if (!props.isFullmessage) {
      return `
        overflow: hidden;
        -webkit-box-orient: vertical;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        word-wrap: break-word;
      `;
    }
    return null;
  }};
`;

const Messenger = styled.div`
  position: absolute;
  right: ${coreSpace};
  bottom: ${coreSpace};
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const LauncherContainer = styled(Launcher)`
  position: absolute;
`;

const WidgetPreview = styled(WidgetPreviewStyled)`
  height: auto;
  bottom: 90px;
  right: ${coreSpace};
  max-height: calc(100% - 95px);
  max-width: calc(100% - 40px);
`;

const WebPreview = styledTS<{ isEngage?: boolean }>(styled.div)`
  min-height: 100%;
  position: relative;
  background: linear-gradient(
    140deg,
    rgba(0, 0, 0, 0) 70%,
    rgba(0, 0, 0, 0.08) 95%,
    rgba(0, 0, 0, 0.1) 100%
  );
  width: ${props => props.isEngage && '100%'};

  .engage-message {
    > div:first-of-type {
      flex-shrink: 0;
      padding: ${coreSpace} ${coreSpace} 10px ${coreSpace};
    }
  }
`;

const MessengerPreview = styled(WebPreview)`
  min-height: 500px;
`;

const ListCounter = styledTS<{ chosen: boolean }>(styled.li)`
  list-style-type: none;
  text-align: left;
  display: list-item;
  background-color: ${props =>
    props.chosen ? colors.borderPrimary : 'transparent'};

  a {
    outline: none;
    text-decoration: none;

    &:focus {
      outline: none;
      text-decoration: none;
    }
  }
`;

const Recipients = styled.div`
  flex: 1;
`;

const Recipient = styled.div`
  padding: 3px 5px;
  border: 1px solid ${colors.colorShadowGray};
  border-radius: 4px;
  display: inline-block;
  margin-right: 5px;
  margin-bottom: 5px;
  background: ${colors.bgLight};
  font-size: 13px;
`;

const Half = styled.div`
  width: 50%;
`;

const StepContent = styled.div`
  display: flex;
`;

const FlexItemCentered = styled.div`
  display: flex;
  justify-content: center;
`;

const Box = styled(BoxRoot)`
  width: 23%;
  height: 200px;
  margin-top: ${coreSpace};
`;

const BoxContent = styled.div`
  margin-top: 40px;
  font-size: 18px;
`;

const BoxHeader = styled.div`
  position: relative;
  background-image: url('/images/patterns/bg-2.png');
  background-repeat: repeat;
  background-position: 0 0;
  height: 90px;
  border-bottom: 1px solid ${colors.borderPrimary};
`;

const IconContainer = styled.div`
  width: ${size}px;
  height: ${size}px;
  margin-top: 40px;
  border-radius: ${size}px;
  display: inline-block;
  background-color: ${colors.colorCoreTeal};

  i {
    color: ${colors.colorWhite};
    font-size: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
`;

const SelectMonth = styled.div`
  flex: 1;

  label {
    margin-top: ${coreSpace};
  }
`;

const DateTimePicker = styled.div`
  margin-top: ${coreSpace};

  .rdtOpen .rdtPicker {
    border:none;

    table {
      width: inherit;
    }
  }

  .rdtCounterSeparator {
    line-height: inherit;
    padding-left: ${dimensions.unitSpacing}px;
  }

  .rdtTime {
    margin-left: -${dimensions.coreSpacing}px;
  }

  .rdtCounter {
    position: relative;
    height: ${dimensions.headerSpacing + 5}px
    color: ${rgba(colors.colorCoreDarkGray, 0.8)};

    .rdtBtn {
      line-height: ${dimensions.unitSpacing}px;
      position: absolute;
      right: 0;
      font-size: 10px;
    }
  }
`;

const StepFormWrapper = styled.div`
  padding: 20px;
`;

const ListWrapper = styled.div`
  padding: ${dimensions.coreSpacing}px;
`;

const RadioContainer = styled.div`
  border-bottom: 1px dotted ${colors.borderPrimary};

  > * {
    padding: ${dimensions.coreSpacing}px;
  }
`;

const CustomerCounts = styled.div`
  text-align: center;

  > i {
    color: ${colors.colorCoreLightGray};
  }
`;

const MessageDescription = styled.div`
  width: 300px;
  white-space: normal;
  font-size: 12px;
  color: ${colors.colorCoreGray};
  padding: ${dimensions.unitSpacing - 5}px 0 ${dimensions.unitSpacing}px;
`;

const EditorContainer = styled.div`
  padding: ${coreSpace};
  flex: 1;
  overflow-y: auto;
`;

const SelectMessageType = styled.div`
  margin: 20px 20px 0 20px;
  width: 300px;
  white-space: normal;
  color: ${colors.colorCoreGray};
`;

export {
  EngageTitle,
  HelperText,
  EngageBox,
  FormWrapper,
  WebPreview,
  PreviewContent,
  Messenger,
  MessengerPreview,
  ListCounter,
  Recipients,
  Recipient,
  Half,
  StepContent,
  FlexItemCentered,
  Box,
  BoxContent,
  BoxHeader,
  IconContainer,
  DateTimePicker,
  SelectMonth,
  LauncherContainer,
  WidgetPreview,
  MessageDescription,
  EditorContainer,
  StepFormWrapper,
  ListWrapper,
  RadioContainer,
  CustomerCounts,
  SelectMessageType
};
