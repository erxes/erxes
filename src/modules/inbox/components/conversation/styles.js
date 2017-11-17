import styled from 'styled-components';
import { colors, dimensions } from 'modules/common/styles';

const MessageContent = styled.div`
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
  border-radius: 7px;
  background: ${colors.colorWhite};
  background: ${props =>
    props.internal ? colors.bgInternal : props.staff && colors.colorSecondary};
  word-break: break-word;
  box-shadow: 0 1px 1px 0 ${colors.darkShadow};
  color: ${props => props.staff && !props.internal && colors.colorWhite};

  p {
    margin: 0;
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
  border-radius: 7px;
  font-size: 12px;
  padding: 0;
  margin-bottom: ${dimensions.coreSpacing}px;
  background: none;
`;

export { MessageItem, MessageBody, MessageContent, FormTable };
