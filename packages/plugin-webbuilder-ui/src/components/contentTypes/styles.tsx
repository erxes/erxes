import { colors, dimensions } from '@erxes/ui/src/styles';

import { FullPreview } from '@erxes/ui/src/components/step/style';
import styled from 'styled-components';

export const TypeFormContainer = styled.div`
  width: 100%;
  display: flex;
  height: 100%;
  overflow: hidden;

  > form {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
`;

export const ContentTypeItem = styled.div`
  margin-left: ${dimensions.unitSpacing - 5}px;
  flex: 1;

  i {
    color: ${colors.colorCoreGray};
    display: block;
  }
`;

export const GroupTitle = styled.div`
  > h4 {
    margin: 30px 0 5px;
  }
`;

export const RightItem = styled.div`
  width: 50%;

  ${FullPreview} {
    padding: 0;
  }
`;
