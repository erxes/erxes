// import { PageHeader } from '@erxes/ui/src/boards/styles/header';
import { colors, dimensions } from '@erxes/ui/src/styles';
import { rgba } from '@erxes/ui/src/styles/ecolor';
import styled from 'styled-components';


// modules/boards/styles/header in *styles.ts
export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 5px ${dimensions.coreSpacing}px 2px;
  background: ${colors.colorWhite};
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
  min-height: 50px;
  z-index: 2;
  @media (max-width: 768px) {
    min-height: auto;
    flex-direction: column;
  }
`;

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
      padding: 0;
      margin-left: 5px;

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
