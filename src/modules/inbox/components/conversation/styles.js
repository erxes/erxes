import styled from 'styled-components';
import { colors, dimensions } from 'modules/common/styles';

const MessageContent = styled.div`
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
  border-radius: 7px;
  border-bottom-left-radius: 0;
  background: ${colors.colorWhite};
  background: ${props =>
    props.internal ? colors.bgInternal : props.staff && colors.colorSecondary};
  word-break: break-word;
  box-shadow: 0 1px 1px 0 ${colors.darkShadow};
  color: ${props => props.staff && !props.internal && colors.colorWhite};
  text-align: left;

  ${props => {
    if (props.staff) {
      return `
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 7px;
      `;
    }
  }};

  a {
    color: ${props => props.staff && colors.colorWhite};
  }

  p {
    margin: 0;
  }

  > span {
    display: block;
  }

  img {
    max-width: 100%;
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

const MessageItem = styled.div`
  margin-bottom: ${dimensions.unitSpacing}px;
  padding-right: ${dimensions.coreSpacing}%;
  display: flex;
  flex-direction: row;
  position: relative;
  clear: both;

  > span {
    position: absolute;
    right: ${props => props.staff && '0'};
  }

  ${props => {
    if (props.staff) {
      return `
        padding-right: 0;
        padding-left: ${dimensions.coreSpacing}%;
        text-align: right;
        flex-direction: row-reverse;
      `;
    }
  }};

  &.attachment ${MessageContent} {
    padding: ${dimensions.unitSpacing}px;

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

const MessageBody = styled.div`
  margin: ${props => (props.staff ? '0 55px 0 0' : '0 0 0 55px')};

  footer {
    font-size: 11px;
    display: inline-block;
    margin-top: 5px;
    color: ${colors.colorCoreGray};
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

export { MessageItem, MessageBody, MessageContent, FormTable };
