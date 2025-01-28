import { colors, dimensions, SidebarList } from '@erxes/ui/src';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const ContentBox = styled.div`
  padding: ${dimensions.coreSpacing}px;
  max-width: 96%;
  margin: 0 auto;
`;

export const List = styled(SidebarList)`
  li {
    border-bottom: 1px solid ${colors.borderPrimary};
    color: ${colors.textPrimary};
    white-space: normal;
    padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;

    span {
      color: ${colors.colorCoreLightGray};
      margin: 0;
    }

    i {
      margin-left: ${dimensions.unitSpacing / 2}px;
    }

    &:last-child {
      border: none;
    }
  }
`;

export const MarginTop = styledTS<{
  borderBottom?: boolean;
}>(styled.div)`
  margin-top: ${dimensions.coreSpacing}px;

  ${(props) => (props.borderBottom ? 'border-bottom: 1px solid #e9e9e9' : '')};
  ${(props) => (props.borderBottom ? 'padding-bottom: 5px;' : '')};
`;

export const FlexRow = styledTS<{
  $alignItems?: string;
  $justifyContent?: string;
}>(styled.div)`
  display: flex;

  > div {
    flex: 1;
    margin-right: ${dimensions.coreSpacing}px;

    &:last-child {
      margin: 0;
    }
  }
`;
