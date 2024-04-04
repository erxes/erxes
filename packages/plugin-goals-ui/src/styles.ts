import styled from 'styled-components';
import styledTS from 'styled-components-ts';

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
export { GoalTypesTableWrapper };
