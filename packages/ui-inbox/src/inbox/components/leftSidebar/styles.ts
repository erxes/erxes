import { colors} from '@erxes/ui/src/styles';
import styled  from 'styled-components';
import styledTS from 'styled-components-ts';

const GroupTitle = styledTS<{ isOpen?: boolean }>(styled.div)`
  font-weight: bold;
  line-height: 32px;
  padding: 0 20px;
  color: ${props => props.isOpen && colors.colorSecondary};
  user-select: none;
  transition: color ease 0.3s;
  display: flex;
  justify-content: space-between;

  a {
    color: ${colors.colorCoreGray};

    &:hover {
      color: ${colors.colorCoreBlack};
    }
  }

  span i {
    margin-left: 5px;
    margin-right: 0;
    display: inline-block;
    transition: all ease 0.3s;
    transform: ${props => props.isOpen && 'rotate(180deg)'};
  }

  > span:hover {
    cursor: pointer;
  }
`;

export {
  GroupTitle,
};
