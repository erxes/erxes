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

const CategoryItem = styledTS<{ isActive: boolean }>(styled.li)`
  position: relative;
  background: ${props => (props.isActive ? colors.bgActive : colors.bgLight)};
  border-bottom: 1px solid ${colors.borderPrimary};
  display: flex;
  padding-right: 20px;
  overflow: hidden;

  a {
    padding: 10px 0 10px 40px;
    white-space: normal;
    display: block;
    color: ${colors.textPrimary};
    position: relative;
    flex: 1;
    max-width: 100%;
    overflow: hidden;

    span {
      color: ${colors.colorCoreGray};
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

    ${ActionButtons} {
      width: 35px;
    }
  }
`;

const CategoryTitle = styledTS<{ isChild?: boolean }>(styled.span)`
  ${props => props.isChild && `padding-left: 20px;`}
`;

export { Categories, CategoryItem, ActionButtons, CategoryTitle };
