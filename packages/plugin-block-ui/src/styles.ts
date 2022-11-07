import { colors, dimensions, SidebarList } from '@erxes/ui/src';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const Action = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: ${dimensions.unitSpacing}px;
`;

const Name = styledTS<{ fontSize?: number }>(styled.div)`
  font-size: ${props => props.fontSize && `${props.fontSize}px`};
  font-weight: 500;

  i {
    margin-left: 10px;
    transition: all 0.3s ease;
    color: ${colors.colorCoreLightGray};

    &:hover {
      cursor: pointer;
      color: ${colors.colorCoreGray};
    }
  }
`;

const Description = styled.div`
  padding: 12px 22px;
  word-break: break-word;
  background: ${colors.bgLight};
  margin: 10px;
  border-radius: 3px;
  min-height: 50px;

  p {
    color: ${colors.textPrimary};
    font-size: 13px;
  }
`;

const List = styled(SidebarList)`
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

export { Action, Name, Description, List };
