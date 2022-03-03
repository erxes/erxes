import styled from 'styled-components';
import { colors } from '@erxes/ui/src/styles';
import { WhiteBoxRoot } from '@erxes/ui/src/layout/styles';
import { LeftItem } from '@erxes/ui/src/components/step/styles';

const PreviewWrapper = styled(WhiteBoxRoot)`
  flex: 1;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0;

  > div {
    max-width: 400px;
  }
`;

const ContentWrapper = styled.div`
  ${LeftItem} {
    padding: 20px 30px;
    flex: 0.5;
    min-width: auto;
  }
`;

const Warning = styled.div`
  margin-bottom: 20px;
  color: ${colors.colorCoreRed};
`;

export {
  Warning,
  ContentWrapper,
  PreviewWrapper
};