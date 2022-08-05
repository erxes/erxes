import { colors, dimensions } from 'modules/common/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { SidebarListItem } from '../styles';
import { SidebarList } from 'modules/layout/styles';

const FilterContainer = styled.div`
  position: relative;
  padding-bottom: ${dimensions.coreSpacing}px;
  z-index: 2;
`;

const ButtonContainer = styled.div`
  button {
    margin: ${dimensions.coreSpacing}px 0 0 ${dimensions.coreSpacing}px;
  }
`;

const FlexRow = styled.div`
  display: flex;
  margin-bottom: ${dimensions.unitSpacing}px;
  padding: 5px 30px 5px 0;
  position: relative;
  align-items: center;

  > label {
    margin: 0;
    font-weight: 500;
    color: ${colors.colorCoreBlack};
  }

  > *:first-child,
  input {
    margin-right: ${dimensions.unitSpacing}px;
    flex: 3;
  }

  > *:nth-child(2),
  > div {
    flex: 2;
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

const LinkButton = styled.a`
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
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

    > i {
      margin-right: 5px;
      color: ${props =>
        !props.level || props.level === 0
          ? colors.colorCoreBlue
          : colors.colorCoreGreen};
    }
  }
`;

const StructureList = styled(SidebarList)`
  > li {
    justify-content: space-between;
  }
`;

const ErrorContainer = styled.div`
  padding: 10px 20px;
`;

export {
  FilterContainer,
  FlexRow,
  ButtonContainer,
  UserAvatar,
  LinkButton,
  RemoveRow,
  InviteOption,
  FormTable,
  SideList,
  StructureList,
  ErrorContainer
};
