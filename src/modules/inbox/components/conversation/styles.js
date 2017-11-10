import styled from 'styled-components';
import { colors, dimensions } from 'modules/common/styles';

const MessageItem = styled.div`
  margin-bottom: ${dimensions.unitSpacing}px;
  padding-right: ${dimensions.coreSpacing}%;
  display: flex;
  flex-direction: row;
  position: relative;
  clear: both;

  > a {
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
`;

const MessageBody = styled.div`
  margin: 0 0 0 55px;
  padding: 15px ${dimensions.coreSpacing}px;
  border-radius: 7px;
  background: ${colors.colorWhite};
  flex-grow: 0;
  word-break: break-word;
  box-shadow: 0 1px 1px 0 ${colors.darkShadow};

  p {
    margin: 0;
  }

  ${props => {
    if (props.staff) {
      return `
        background-color: ${
          props.internal ? colors.colorCoreYellow : colors.colorSecondary
        };
        margin: 0 55px 0 0;
        color: ${colors.colorWhite};
      `;
    }
  }};
`;

const FormTable = styled.div`
  border: 1px solid ${colors.borderPrimary};
  border-radius: 7px;
  font-size: 12px;
  padding: 0;
  margin-bottom: ${dimensions.coreSpacing}px;
  background: none;
`;

export { MessageItem, MessageBody, FormTable };
