import { colors, dimensions } from 'modules/common/styles';
import { BoxRoot } from 'modules/common/styles/main';
import styled from 'styled-components';

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

const PreviewContent = styled.div`
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
  }};
`;

const Messenger = styled.div`
  width: 300px;
  position: absolute;
  right: ${coreSpace};
  bottom: ${coreSpace};
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const WebPreview = styled.div`
  min-height: 100%;
  flex: 1;
  position: relative;
  width: calc(100% - ${coreSpace});
  margin-left: auto;
  margin-top: -1px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0) 30%,
    rgba(255, 255, 255, 0.3) 60%,
    ${colors.borderPrimary} 100%
  );

  .engage-message {
    > div:first-of-type {
      flex-shrink: 0;
      padding: ${coreSpace} ${coreSpace} 10px ${coreSpace};
    }
  }
`;

const MessengerPreview = WebPreview.extend`
  min-height: 500px;
`;

const Segmentli = styled.li`
  list-style-type: none;
  text-align: left;
  display: list-item;
  background-color: ${props =>
    props.chosen ? colors.borderPrimary : 'transparent'};

  a {
    &:focus {
      outline: none;
      text-decoration: none;
    }
    outline: none;
    text-decoration: none;
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

const StepContent = styled.div`
  display: flex;
`;

const FlexItemCentered = styled.div`
  display: flex;
  justify-content: center;
`;

const Box = BoxRoot.extend`
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
    margin-top: 20px;
  }
`;

const DateTimePicker = styled.div`
  margin-top: ${coreSpace};
  position: relative;

  input {
    font-size: 13px;
    border-color: ${colors.colorShadowGray};
    box-shadow: none;
    cursor: pointer;
  }

  input:focus {
    box-shadow: none;
    border-color: ${colors.colorSecondary};
  }

  > i {
    position: absolute;
    right: 1px;
    top: 1px;
    padding: 6px 10px;
    background: ${colors.borderPrimary};
    border-right-radius: 13px;
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
  }

  .rdtOpen .rdtPicker {
    font-size: 12px;
    max-width: inherit;
    width: 100%;
  }

  .rdtCounter .rdtBtn {
    height: 30%;
    line-height: 30px;
  }
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
  Segmentli,
  Recipients,
  Recipient,
  StepContent,
  FlexItemCentered,
  Box,
  BoxContent,
  BoxHeader,
  IconContainer,
  DateTimePicker,
  SelectMonth
};
