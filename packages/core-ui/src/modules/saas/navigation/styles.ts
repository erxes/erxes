import { colors } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import styled from 'styled-components';

const shadowColor = 'rgba(0,0,0,0.15)';

const SubMenu = styled.div`
  position: relative;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  span {
    float: none;
    margin: 0 5px 0 0;
  }

  i {
    width: 10px;
  }
`;

const NameCardWrapper = styled.div`
  padding: 10px 20px;
  &:hover {
    background: ${rgba(colors.colorBlack, 0.06)};
    opacity: 1;
  }
`;

const NavItem = styled.div`
  padding-left: 18px;
  display: table-cell;
  vertical-align: middle;

  > a {
    color: ${colors.textSecondary};
    display: flex;
    align-items: center;

    &:hover {
      color: ${colors.colorSecondary};
    }
  }

  .dropdown-menu {
    min-width: 240px;
  }
`;

const List = styled.ul`
  list-style: none;
  position: absolute;
  padding: 10px 0;
  right: 100%;
  top: 0;
  background: ${colors.colorWhite};
  box-shadow: 0 5px 15px 1px ${shadowColor};
  transition: all 0.3s ease;
  visibility: hidden;
  opacity: 0;
  min-width: 240px;
  max-width: 300px;
  margin: 0;

  > li > a {
    text-overflow: ellipsis;
    overflow: hidden;
  }

  > li.active a {
    color: ${colors.textPrimary};
    position: relative;
    padding-right: 40px;

    i {
      position: absolute;
      right: 20px;
      top: 0;
    }

    &:hover {
      color: ${colors.colorPrimaryDark};
    }
  }
`;

const Add = styled.a`
  padding: 10px 20px !important;
  font-weight: 500;
  transition: background 0.3s ease;

  span {
    display: block;
    color: ${colors.colorCoreGray};
    font-weight: normal;
  }
`;

const ExistingOrg = styled(Add.withComponent('div'))`
  padding: 10px 0 !important;
`;

const Container = styled.div`
  padding: 4px 20px;
  transition: background 0.3s ease;
  margin-bottom: 5px;

  li {
    display: flex;
    justify-content: space-between;
  }

  &:hover {
    background: ${colors.bgActive};
    cursor: pointer;

    ${List} {
      visibility: visible;
      opacity: 1;
    }
  }
`;

export {
  NameCardWrapper,
  UserInfo,
  SubMenu,
  Container,
  Add,
  List,
  NavItem,
  ExistingOrg,
};
