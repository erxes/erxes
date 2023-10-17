import styled from 'styled-components';
import { DrawerDetail } from '@erxes/ui-automations/src/styles';
import styledTS from 'styled-components-ts';
import { colors, dimensions } from '@erxes/ui/src/styles';
import { highlight } from '@erxes/ui/src/utils/animations';
export const DividerBox = styled.span`
  margin-bottom: ${dimensions.coreSpacing}px;
  color: ${colors.colorCoreRed};
  border: 1px solid ${colors.colorCoreRed};
  border-radius: 2px;
  padding: 3px 5px;
  font-size: 8px;
  display: inline-block;
  font-weight: bold;
  text-transform: uppercase;
`;
const GoalTypesTableWrapper = styled.div`
  td {
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
const SidebarFilters = styledTS(styled.div)`
  overflow: hidden;
  padding: 5px 15px 30px 15px;
`;
export { SidebarFilters };
export { GoalTypesTableWrapper, FlexRow };

export const BoardItemWrapper = styled(DrawerDetail)`
  > div > div {
    padding: 0;
  }
`;

export const Card = styled.div`
  display: flex;
  width: 150px;
  height: 40px;
  text-align: center;
  margin-bottom: 5px;
  border-radius: 6px;
  box-shadow: 0 0 5px 0 rgba(221, 221, 221, 0.7);
  justify-content: center;
  place-items: center;
  cursor: pointer;
  gap: 5px;

  &.active {
    animation: ${highlight} 0.9s ease;
    box-shadow: 0 0 5px 0 #63d2d6;
  }
`;
const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  .flex-item {
    flex: 1;
    margin-left: ${dimensions.coreSpacing}px;

    &:first-child {
      margin: 0;
    }

    input[type='checkbox'] {
      display: inline-block;
      height: auto;
      width: auto;
      margin-right: 5px;
    }
  }

  button {
    margin-left: ${dimensions.coreSpacing / 2}px;
  }

  & + div {
    margin-top: ${dimensions.coreSpacing / 2}px;
  }
`;
