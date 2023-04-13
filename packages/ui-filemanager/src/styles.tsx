import { BoxRoot } from '@erxes/ui/src/styles/main';
import { colors } from '@erxes/ui/src/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const ChooseBox = styled(BoxRoot)`
  width: 200px;
  padding: 30px;
  margin: 0;
  background: ${colors.bgLight};

  i {
    font-size: 38px;
    color: ${colors.colorSecondary};
  }

  span {
    font-weight: 500;
    font-size: 14px;
    text-transform: capitalize;
  }
`;

export const FileUpload = styled.div`
  input {
    display: none;
  }
`;

export const FlexContainer = styledTS<{ direction?: string }>(styled.div)`
  display: flex;
  justify-content: space-between;
  flex-direction: ${props => props.direction};
`;
