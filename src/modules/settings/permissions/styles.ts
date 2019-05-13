import styled from 'styled-components';

const FilterWrapper = styled.div`
  padding: 5px 0;
  display: flex;
  flex-wrap: wrap;
`;

const FilterItem = styled.div`
  position: relative;
  float: left;
  min-width: 180px;
  margin-right: 20px;
`;

const NotWrappable = styled.div`
  white-space: nowrap;
`;

export { FilterWrapper, FilterItem, NotWrappable };
