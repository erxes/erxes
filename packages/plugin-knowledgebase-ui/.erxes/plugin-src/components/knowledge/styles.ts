import { colors, dimensions } from '@erxes/ui/src/styles';
import styled from 'styled-components';

const KnowledgeBaseRow = styled.div`
  border-bottom: 1px solid ${colors.borderPrimary};
`;

const RowActions = styled.div`
  font-size: 12px;
  color: ${colors.colorCoreGray};
  padding-right: ${dimensions.coreSpacing}px;

  i {
    padding: ${dimensions.unitSpacing}px 0;
  }

  &:hover {
    cursor: pointer;
  }
`;

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SectionTitle = styled.div`
  flex: 1;
  cursor: pointer;
  padding: 10px ${dimensions.coreSpacing}px;

  span {
    display: block;
    font-size: 12px;
    color: ${colors.colorCoreGray};
  }
`;

export { KnowledgeBaseRow, RowActions, SectionHead, SectionTitle };
