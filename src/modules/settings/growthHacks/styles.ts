import { LeftItem } from 'modules/common/components/step/styles';
import { colors, dimensions } from 'modules/common/styles';
import { BoxRoot } from 'modules/common/styles/main';
import { WhiteBoxRoot } from 'modules/layout/styles';
import styled from 'styled-components';

const TemplateContainer = styled.div`
  display: flex;
  padding: 20px 0 20px 20px;
  flex-wrap: wrap;
`;

const TemplateItem = styled.div`
  flex-basis: 300px;
  padding: 25px 30px;
  margin: 0 ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 6px;
  box-shadow: 0 0 20px 2px rgba(0, 0, 0, 0.1);

  h5 {
    margin: 0 0 5px;
    line-height: 22px;
    color: ${colors.colorPrimaryDark};
  }

  p {
    margin: 0;
    color: ${colors.colorCoreGray};
  }
`;

const Box = styled(BoxRoot)`
  flex: 1;
  padding: ${dimensions.coreSpacing}px;
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
    padding: 20px 30px;
    flex: 0.5;
    min-width: auto;
  }
`;

const Bottom = styled.div`
  overflow: hidden;
`;

const Created = styled.div`
  margin-top: ${dimensions.coreSpacing}px;
  float: left;
`;

const Actions = styled.div`
  float: right;
  margin-top: ${dimensions.coreSpacing}px;
  justify-content: flex-end;

  > div {
    float: left;
    padding: 3px 6px;
    width: 26px;
    height: 26px;
    border-radius: 13px;
    margin-left: 5px;
    background-color: ${colors.bgActive};
    transition: background-color 0.3s ease;

    &:hover {
      cursor: pointer;
      background-color: ${colors.colorShadowGray};
    }
  }
`;

export {
  TemplateItem,
  Box,
  Bottom,
  PreviewWrapper,
  ContentWrapper,
  TemplateContainer,
  Actions,
  Created
};
