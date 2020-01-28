import { DateContainer } from 'modules/common/styles/main';
import styled from 'styled-components';

const FilterWrapper = styled.div`
  padding: 5px 0;
  display: flex;
  flex-wrap: wrap;
`;

const FilterItem = styled(DateContainer)`
  position: relative;
  float: left;
  min-width: 200px;
  margin-right: 20px;
`;

export { FilterWrapper, FilterItem };
