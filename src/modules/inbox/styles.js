import styled from 'styled-components';
import { colors } from '../common/styles';

const PopoverButton = styled.div`
  display: inline-block;
  position: relative;

  * {
    display: inline-block;
  }

  i {
    margin-left: 5px;
    margin-right: 0;
  }

  &[aria-describedby] {
    color: ${colors.colorSecondary};
  }
`;

export { PopoverButton };
