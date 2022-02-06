import colors from 'modules/common/styles/colors';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const LogBox = styledTS<{ color?: string }>(styled.div)`
  border: 1px dotted ${props =>
    props.color ? props.color : colors.colorPrimary};
  padding: 10px;
  margin: 10px;
  width: 45%;
  
  > div {
    margin-bottom: 10px;

    > ul {
      margin: 0;
    }
  }

  .field-name {
    font-weight: bold;  
  }

  .field-value {
    padding-left: 10px;
    
    > div {
      display: inline-block;
    }
  }

  &:hover {
    overflow: auto;
  }
`;

export { LogBox };
