import colors from 'modules/common/styles/colors';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

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

export { LogBox };
