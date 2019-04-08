import styled from 'styled-components';

const FilterWrapper = styled.div`
  padding: 5px 0;
  display: flex;
  flex-wrap: wrap;
`;

const FilterItem = styled.div`
  position: relative;
  z-index: 100;
  float: left;
  min-width: 180px;
  margin-right: 20px;
`;

export { FilterWrapper, FilterItem };
