import styled from 'styled-components';
import { colors } from '@erxes/ui/src/styles';
import { DateContainer } from '@erxes/ui/src/styles/main';

const FilterWrapper = styled.div`
  margin: 10px 20px 0 20px;
  padding-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  border-bottom: 1px solid ${colors.borderPrimary};

  strong {
    margin-right: 10px;
  }
`;

const FilterItem = styled(DateContainer)`
  position: relative;
  float: left;
  min-width: 200px;
  margin-right: 20px;
  z-index: 100;
`;

const NotWrappable = styled.div`
  white-space: nowrap;
`;

const Capitalize = styled.span`
  text-transform: capitalize;
  font-weight: 500;
`;

export { FilterWrapper, FilterItem, NotWrappable, Capitalize };
