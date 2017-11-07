import styled from 'styled-components';
import { colors, dimensions } from 'modules/common/styles';

const coreSpace = `${dimensions.coreSpacing}px`;

const EngageTitle = styled.div`
  font-weight: 400;

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

const FormHeader = styled.div`
  margin-bottom: ${coreSpace};
`;

const EditorWrapper = styled.div`
  flex: 1;
  min-height: 160px;
  border: 1px solid ${colors.colorShadowGray};
  margin-top: ${dimensions.unitSpacing}px;

  .RichEditor-controls-root {
    padding: 10px ${coreSpace} 5px;
    background: ${colors.bgLight};
  }

  .RichEditor-editor .public-DraftEditor-content {
    padding: ${coreSpace};
    min-height: 200px;
    word-break: break-word;
  }
`;

const ButtonBox = styled.div`
  cursor: pointer;
  display: block;
  padding: ${coreSpace} ${coreSpace};
  border: 1px solid
    ${props => (props.selected ? colors.colorSecondary : colors.borderPrimary)};
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  text-align: center;
  margin-bottom: ${dimensions.unitSpacing}px;

  &:first-child {
    margin-bottom: ${coreSpace};
  }

  span {
    margin-bottom: 5px;
    font-weight: bold;
  }

  p {
    margin-bottom: 0;
    color: ${colors.colorCoreLightGray};
    font-size: 12px;
  }

  &:hover {
    ${props => {
      if (!props.selected) {
        return `
          border: 1px dotted ${colors.colorSecondary};
        `;
      }
    }};
  }
`;

const FlexContent = styled.div`
  display: flex;
  flex: 1;
  min-height: 100%;
`;

const FlexItem = styled.div`
  flex: 1;
  position: relative;
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
const InlineForm = styled.div`
  display: flex;
  flex-direction: row;

  > *:not(:first-child) {
    margin-left: ${dimensions.unitSpacing}px;
  }
`;

export {
  EngageTitle,
  HelperText,
  EngageBox,
  ButtonBox,
  FormWrapper,
  EditorWrapper,
  FormHeader,
  FlexContent,
  FlexItem,
  WebPreview,
  PreviewContent,
  Messenger,
  MessengerPreview,
  InlineForm
};
