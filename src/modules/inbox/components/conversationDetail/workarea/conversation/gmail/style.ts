import { colors, dimensions } from 'modules/common/styles';
import styled from 'styled-components';

const dateColor = '#666';
const subjectColor = '#202124';

const InternalMessages = styled.div`
  padding: 0 ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px;
`;

const EmailItem = styled.div`
  padding: ${dimensions.coreSpacing}px;
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
  color: ${subjectColor};
  font-weight: 400;
  margin: 0 0 ${dimensions.coreSpacing}px;
  padding-left: 45px;
`;

const Meta = styled.div`
  margin-bottom: ${dimensions.coreSpacing}px;
  display: flex;
  flex-direction: row;
  align-items: center;

  strong {
    display: block;
  }
`;

const Details = styled.div`
  margin-left: 13px;
  flex: 1;

  span {
    color: ${colors.textSecondary};
    margin-right: 10px;
  }
`;

const Date = styled.div`
  margin: 0 10px;
  font-size: 12px;
  color: ${dateColor};
`;

const RightSide = styled.div`
  display: flex;
  align-items: center;
`;

export {
  EmailItem,
  Subject,
  Meta,
  Date,
  Details,
  Content,
  InternalMessages,
  RightSide
};
