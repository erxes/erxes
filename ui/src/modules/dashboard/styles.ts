import { PageHeader } from 'modules/boards/styles/header';
import { colors, dimensions } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import styled from 'styled-components';

const Header = styled(PageHeader)`
  min-height: auto;
`;

const Title = styled.div`
  font-size: 24px;
  display: flex;
  align-items: center;
  margin-top: 7px;

  i {
    font-size: 22px;
    color: ${colors.colorCoreGray};
    margin: 5px 0 0 ${dimensions.unitSpacing}px;
  }

  &:hover {
    cursor: pointer;
  }
`;

const RightActions = styled.div`
  align-self: center;

  a {
    margin-left: ${dimensions.unitSpacing}px;
  }

  button {
    margin: ${dimensions.unitSpacing}px 0;
  }
`;

const Dashboards = styled.ul`
  padding: 0;
  min-width: 280px;
  max-height: 75vh;
  overflow: auto;
  margin: -8px 0 0 0;

  > li {
    border-color: rgba(0, 0, 0, 0.06);

    button {
      font-size: 14px;

      i {
        color: ${colors.colorSecondary};
      }
    }

    > a {
      padding: ${dimensions.unitSpacing}px 0 ${dimensions.unitSpacing}px 20px;
      white-space: normal;

      &:hover {
        background: transparent;
      }
    }

    &:hover {
      background: ${rgba(colors.colorPrimary, 0.1)};
    }
  }
`;

const Create = styled.div`
  padding: 8px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: -8px;
  font-weight: 500;
  color: ${colors.colorSecondary};

  &:hover {
    cursor: pointer;
    background: ${rgba(colors.colorPrimary, 0.1)};
  }
`;

export { Title, RightActions, Dashboards, Create, Header };
