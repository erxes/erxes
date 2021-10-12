import styled from 'styled-components';
import { dimensions, colors } from 'modules/common/styles';
import { FilterItem } from 'modules/settings/permissions/styles';

export const HistoriesWrapper = styled.div`
  padding: ${dimensions.coreSpacing}px;
  height: 100%;
`;

export const FilterWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: ${dimensions.coreSpacing}px;

  .icon-option > i {
    color: ${colors.colorCoreGray};
  }

  .Select {
    flex: 1;
  }
`;

export const FilterDateItem = styled(FilterItem)`
  z-index: 10;
`;
