import {
  TabCaption,
  TabContainer
} from '@erxes/ui/src/components/tabs/styles';
import { colors } from '@erxes/ui/src/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const RightMenuContainer = styled.div`
  position: fixed;
  z-index: 2;
  top: 100px;
  right: 0;
  bottom: 0;
  width: 300px;
  background: ${colors.bgLight};
  white-space: normal;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 12px 24px -6px rgba(9, 30, 66, 0.25),
    0 0 0 1px rgba(9, 30, 66, 0.08);

  ${TabContainer} {
    height: 40px;
  }

  ${TabCaption} {
    padding: 10px 20px;
  }
`;
