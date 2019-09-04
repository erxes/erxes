import { LeftItem } from 'modules/common/components/step/styles';
import { colors } from 'modules/common/styles';
import { BoxRoot } from 'modules/common/styles/main';
import { WhiteBoxRoot } from 'modules/layout/styles';
import styled from 'styled-components';
import { TemplateBox } from '../emailTemplates/styles';

const TemplateBoxContent = styled(TemplateBox)`
  padding: 20px;

  h5 {
    margin-top: 0;
  }
`;

const Box = styled(BoxRoot)`
  flex: 1;
  padding: 20px;
  text-align: left;
  background: ${colors.colorWhite};
  margin: 10px 20px 0 0;

  b {
    font-size: 30px;
    text-transform: uppercase;
    color: ${colors.colorCoreLightGray};
  }

  p {
    margin: 10px 0 0;
    font-size: 12px;
    color: ${colors.textSecondary};
  }

  &:last-of-type {
    margin-right: 0;
  }
`;

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
    padding: 30px;
    flex: 0.5;
    min-width: auto;
  }
`;

export { TemplateBoxContent, Box, PreviewWrapper, ContentWrapper };
