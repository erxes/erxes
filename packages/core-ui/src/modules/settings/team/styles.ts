import { colors, dimensions } from '@erxes/ui/src/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { SidebarListItem } from '@erxes/ui-settings/src/styles';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import { lighten } from '@erxes/ui/src/styles/ecolor';

const ButtonContainer = styled.div`
  margin: 0 0 14px 0;
`;

const FlexRow = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;

  > label {
    margin: 0;
    font-weight: 500;
    color: ${colors.colorCoreBlack};
  }

  > *:first-child,
  input {
    margin-right: ${dimensions.unitSpacing}px;
  }
`;

const RemoveRow = styled.a`
  top: ${dimensions.unitSpacing + 2}px;
  margin-left: ${dimensions.unitSpacing}px;
  padding: ${dimensions.unitSpacing / 2}px;
  color: ${colors.colorCoreDarkGray};

  &:hover {
    cursor: pointer;
    color: ${colors.colorCoreRed};
  }
`;

const UserAvatar = styled.td`
  &:hover {
    cursor: pointer;
  }
`;

const InviteOption = styled.div`
  margin-top: ${dimensions.coreSpacing}px;
`;

const FormTable = styled.table`
  width: 100%;

  td {
    padding-right: ${dimensions.coreSpacing}px;
    width: 14%;
  }

  tr {
    td:last-child,
    td:nth-child(5) {
      padding: 0;
    }
  }
`;

const SideList = styledTS<{
  isActive?: boolean;
  level?: number;
}>(styled(SidebarListItem))`
  white-space: normal !important;
  border: 0;
  padding-left: ${props => `${(props.level || 0) * 30 + 20}px !important`};

  > span {
    width: 90%;
    display: flex;
    color: ${props => props.isActive && colors.colorPrimary};

    &:hover {
      color: ${props => !props.isActive && lighten(colors.textPrimary, 40)};
    }

    > i {
      margin-right: 5px;
      color: ${props =>
        props.isActive
          ? colors.colorPrimary
          : !props.level || props.level === 0
          ? colors.colorCoreBlue
          : colors.colorCoreGreen};
    }
  }

  &:hover {
    background: ${props => !props.isActive && colors.bgLight};
  }
`;

const StructureList = styled(SidebarList)`
  > li {
    justify-content: space-between;
  }
`;

const StructureEditButton = styled.div`
  cursor: pointer;
  padding: 10px;
  color: ${colors.textSecondary};

  &:hover {
    color: ${colors.textPrimary};
  }
`;

const DescriptionContent = styled.div`
  text-align: center;
  display: flex;

  h4 {
    margin-left: 8px;
    font-size: 16px;
    padding-bottom: 0;
  }
`;

export {
  FlexRow,
  ButtonContainer,
  UserAvatar,
  RemoveRow,
  InviteOption,
  FormTable,
  SideList,
  StructureList,
  DescriptionContent,
  StructureEditButton
};
