import { colors } from '@erxes/ui/src/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const ContractsTableWrapper = styled.div`
  td {
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const ScrollTableColls = styled.div`
  overflow-x: scroll;
  overflow-y: hidden;
  width: 100%;
  white-space: nowrap;
`;

const ExtraRow = styledTS<{ isDefault?: boolean }>(styled.tr)`
  background: ${(props) => (props.isDefault ? '' : '#F7F8FC')};
`;

const DidAmount = styled.span`
  display: contents;
  align-items: center;
  color: ${colors.textPrimary};
`;

export { ContractsTableWrapper, ScrollTableColls, ExtraRow, DidAmount };
