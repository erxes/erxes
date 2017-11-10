import styled from 'styled-components';
import { colors } from '../common/styles';

const PopoverButton = styled.div`
  display: inline-block;
  position: relative;

  > * {
    display: inline-block;
  }

  button {
    padding: 8px 0;
  }

  i {
    margin-left: 5px;
    margin-right: 0;
  }

  &[aria-describedby] {
    color: ${colors.colorSecondary};
  }

  &:hover {
    cursor: pointer;
  }
`;

export { PopoverButton };
