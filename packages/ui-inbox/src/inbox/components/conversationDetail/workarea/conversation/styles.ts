import { AttachmentWrapper, Meta } from '@erxes/ui/src/components/Attachment';
import { colors, dimensions } from '@erxes/ui/src/styles';
import { darken, rgba } from '@erxes/ui/src/styles/ecolor';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';

const MessageContent = styledTS<{ internal?: boolean; staff?: boolean }>(
  styled.div
)`
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
  border-radius: 20px;
  border-bottom-left-radius: 2px;
  background: ${colors.colorWhite};
  background: ${props =>
    props.internal ? colors.bgInternal : props.staff && colors.colorSecondary};
  word-break: break-word;
  box-shadow: 0 1px 1px 0 ${colors.darkShadow};
  color: ${props => props.staff && !props.internal && colors.colorWhite};
  text-align: left;

  ${props =>
    props.staff &&
    css`
      border-bottom-right-radius: 2px;
      border-bottom-left-radius: 20px;

      ${AttachmentWrapper}, ${Meta} {
        color: ${rgba(colors.colorWhite, 0.9)};
      }
    `};

  a {
    color: ${props =>
      props.staff && !props.internal ? colors.colorWhite : colors.linkPrimary};
    text-decoration: underline;
  }

  p {
    margin: 0;
  }

  > span {
    display: block;
  }

  img {
    max-width: 300px;
    border-radius: 2px;
  }

  ul,
  ol {
    padding-left: 25px;
    margin: 0;
  }

  h3 {
    margin-top: 0;
  }

  blockquote {
    margin-bottom: 0;
    border-color: ${colors.borderDarker};
  }

  pre {
    margin-bottom: 0;
  }
`;

const MessageBody = styledTS<{ staff?: boolean }>(styled.div)`
  margin: ${props => (props.staff ? '0 55px 0 0' : '0 0 0 55px')};
  display: flex;
  flex-direction: ${props => (props.staff ? 'row-reverse' : 'row')};
  align-items: center;

  footer {
    flex-shrink: 0;
    font-size: 11px;
    display: inline-block;
    color: ${colors.colorCoreLightGray};
    margin: 0 10px;
    cursor: pointer;
  }

  > img {
    box-shadow: 0 1px 1px 0 ${colors.darkShadow};
    max-width: 100%;
  }
`;

const MessageItem = styledTS<{
  isSame?: boolean;
  staff?: boolean;
  isBot?: boolean;
}>(styled.div)`
  margin-top: ${props => (props.isSame ? dimensions.unitSpacing - 5 : 20)}px;
  padding-right: 17%;
  display: flex;
  flex-direction: row;
  position: relative;
  clear: both;

  > span {
    position: absolute;
    right: ${props => props.staff && '0'};
    bottom: 0;
  }

  ${props =>
    props.isBot &&
    css`
      padding-right: 0;

      ${MessageBody} {
        flex-direction: column;
        align-items: flex-start;
      }

      ${MessageContent} {
        border-radius: 20px;
      }
    `};

  ${props => {
    if (!props.staff) {
      return '';
    }

    return `
      padding-right: 0;
      padding-left: 10%;
      text-align: right;
      flex-direction: row-reverse;
    `;
  }};

  &.same {
    ${MessageContent} {
      border-top-left-radius: ${props => !props.staff && '2px'};
      border-top-right-radius: ${props => props.staff && '2px'};
    }

    &:last-of-type {
      ${MessageContent} {
        border-bottom-right-radius: ${props => props.staff && '20px'};
        border-bottom-left-radius: ${props => !props.staff && '20px'};
      }
    }
  }

  &.attachment ${MessageContent} {
    padding: ${dimensions.coreSpacing}px;

    > span {
      margin-bottom: 5px;
    }

    br {
      display: none;
    }
  }

  &.fbpost {
    .body {
      padding: 12px;
      background: #f6f7f9;
      border: 1px solid;
      border-color: #e5e6e9 #dfe0e4 #d0d1d5;
      border-radius: 4px;
    }
  }
`;

const FormTable = styled.div`
  border: 1px solid ${colors.borderPrimary};
  border-radius: 2px;
  font-size: 12px;
  padding: 0;
  margin-bottom: ${dimensions.coreSpacing}px;
  background: ${colors.colorWhite};

  table thead th:last-child {
    text-align: center;
    color: ${colors.colorCoreBlack};
  }

  table tr td {
    word-break: break-word;
  }
`;

const CellWrapper = styled.div`
  display: inline-block;
  max-width: 100%;

  > a {
    display: block;

    div:first-child {
      float: left;
    }
  }
`;

const CallBox = styled.div`
  border: 1px solid ${colors.borderPrimary};
  border-radius: 5px;
  background: ${colors.colorWhite};
  text-align: left;
  float: right;
  box-shadow: rgba(0, 0, 0, 0.06) 0px 0px 6px 1px;
`;

const AppMessageBox = styled(CallBox)`
  width: 320px;
  text-align: center;
`;

const CallButton = styled.div`
  padding: ${dimensions.coreSpacing}px;
  border-top: 1px solid ${colors.borderPrimary};

  h5 {
    margin-top: 0;
    margin-bottom: 15px;
  }

  button,
  a {
    width: 100%;
    border-radius: 5px;
    background: ${colors.colorCoreBlue};
    font-size: 14px;
    padding: 10px 20px;
    text-transform: initial;
    box-shadow: none;
  }

  a {
    display: block;
    color: ${colors.colorWhite};

    &:hover {
      background: ${darken(colors.colorCoreBlue, 10)};
    }
  }
`;

const UserInfo = styled.div`
  padding: ${dimensions.coreSpacing}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-top: 3px solid ${colors.colorCoreBlue};
  border-radius: 5px;

  h4 {
    margin: 20px 0 0 0;
    font-size: 16px;
  }

  h5 {
    margin-top: 0;
  }

  h3 {
    margin: 0;
  }
`;

const FlexItem = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const FormMessageInput = styled.div`
  padding: ${dimensions.unitSpacing - 4}px ${dimensions.coreSpacing - 5}px;
  color: ${colors.textPrimary};
  border: 1px solid ${colors.colorShadowGray};
  margin-top: ${dimensions.unitSpacing - 5}px;
  background: #faf9fb;
  border-radius: 5px;
  font-size: 14px;
  min-height: 35px;
  overflow-wrap: break-word;
  box-shadow: inset 0 1px 3px 0 rgba(0, 0, 0, 0.07);

  img {
    max-height: 150px !important;
  }
`;

const FieldWrapper = styledTS<{ column?: number }>(styled.div)`
  input, .Select {
    pointer-events: none;
    cursor: default;

    .Select-value {
      padding: 0;
    }

    .Select-input, .Select-clear-zone, .Select-arrow-zone, .Select-value-icon {
      display: none !important;
    }
  }

${props =>
  props.column &&
  css`
    width: ${100 / props.column}%;
    display: inline-block;
  `}
`;

const ProductItem = styledTS(styled.div)`
  display:flex;
  justify-content: space-between;

  img {
    width: 100px;
    height: 100px;
    border-radius: 8px;
  }
`;

export {
  MessageItem,
  MessageBody,
  MessageContent,
  FormTable,
  AppMessageBox,
  CallButton,
  UserInfo,
  FlexItem,
  CallBox,
  CellWrapper,
  FieldWrapper,
  FormMessageInput,
  ProductItem
};
