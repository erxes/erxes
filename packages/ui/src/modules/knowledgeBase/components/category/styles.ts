import { colors } from 'modules/common/styles';
import { ActionButtons } from 'modules/settings/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const Categories = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid ${colors.borderPrimary};
`;

const CategoryItem = styledTS<{
  isActive: boolean;
  isChild: boolean | undefined;
}>(styled.li)`
  position: relative;
  background: ${props => (props.isActive ? colors.bgActive : colors.bgLight)};
  border-bottom: 1px solid ${colors.borderPrimary};
  display: flex;
  padding-right: 20px;
  overflow: hidden;

  a {
    padding: ${props =>
      props.isChild ? '10px 0 10px 55px' : '10px 0 10px 40px'};
    white-space: normal;
    display: block;
    color: ${colors.textPrimary};
    position: relative;
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 100%;
    overflow: hidden;
    
    > i {
      font-size: 18px;
      color: ${colors.colorCoreGray};
      transition: all ease 0.3s;
      line-height: 20px;
    }

    span {
      color: ${colors.colorCoreGray};
      padding-left: 5px;
    }

    &:focus {
      color: inherit;
      text-decoration: none;
    }
  }

  &:last-child {
    border: none;
  }

  &:hover {
    background: ${props =>
      props.isActive ? colors.bgActive : colors.colorWhite};
    
    a > i {
      display: none;
    }

    ${ActionButtons} {
      width: 35px;
    }
  }
`;

export { Categories, CategoryItem, ActionButtons };
