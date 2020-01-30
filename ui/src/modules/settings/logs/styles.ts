import colors from 'modules/common/styles/colors';
import { DateContainer } from 'modules/common/styles/main';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

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

const LogBox = styledTS<{ color?: string }>(styled.div)`
  border: 1px dotted ${props =>
    props.color ? props.color : colors.colorPrimary};
  padding: 5px;
  margin: 5px;

  .field-name {
    font-weight: 500;
  }

  .field-value {
    padding-left: 10px;
    font-weight: 700;
    color: ${props => (props.color ? props.color : colors.colorPrimary)}
  }

  &:hover {
    overflow: auto;
  }
`;

export { FilterWrapper, FilterItem, LogBox };
