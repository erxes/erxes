import { LeftItem } from '@erxes/ui/src/components/step/styles';
import { colors, dimensions } from '@erxes/ui/src/styles';
import { DateContainer } from '@erxes/ui/src/styles/main';
import { WhiteBoxRoot } from '@erxes/ui/src/layout/styles';
import styled from 'styled-components';

const BoxItem = styled.div`
  flex-basis: 300px;
  padding: 25px 30px;
  margin: 0 ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 6px;
  box-shadow: 0 0 20px 2px rgba(0, 0, 0, 0.1);
  position: relative;

  h5 {
    margin: 0 0 5px;
    line-height: 22px;
    color: ${colors.colorPrimaryDark};
  }

  p {
    margin: 0;
    color: ${colors.colorCoreGray};
    word-break: break-word;
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
  margin-top: ${dimensions.coreSpacing}px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Created = styled.div`
  font-size: 12px;
  color: ${colors.textSecondary};
  font-style: italic;
`;

const Actions = styled.div`
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

const DateItem = styled(DateContainer)`
  flex: 1;
  margin-right: 20px;
`;

const Warning = styled.div`
  margin-bottom: 20px;
  color: ${colors.colorCoreRed};
`;

export {
  BoxItem,
  Bottom,
  PreviewWrapper,
  ContentWrapper,
  Actions,
  Created,
  DateItem,
  Warning
};
