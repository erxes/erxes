import { colors, dimensions } from 'modules/common/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const MessageContent = styledTS<{ internal?: boolean; staff?: boolean }>(
  styled.div
)`
 
`;

const EmailItem = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${colors.borderPrimary};

  &:last-of-type {
    border: none;
  }
`;

const Content = styled.div`
  font-size: 13px;
  padding: 0 45px;

  blockquote {
    font-size: 13px;
  }

  table {
    border-collapse: initial;
    background-color: unset;
  }
`;

const Subject = styled.h2`
  font-size: 26px;
  color: #202124;
  font-weight: 400;
  margin: 0 0 20px;
  padding-left: 45px;
`;

const Meta = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;

  strong {
    display: block;
  }

  > div {
    margin-left: 13px;
  }
`;

export { EmailItem, Subject, Meta, Content, MessageContent };
