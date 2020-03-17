import { colors, dimensions } from 'modules/common/styles';
import { darken, lighten } from 'modules/common/styles/color';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const GroupHead = styledTS<{
  disabled?: boolean;
  vertical?: boolean;
  isComplete?: boolean;
}>(styled.div)`
  display: inline-flex;
  background: ${colors.colorWhite};
  border-radius: ${dimensions.unitSpacing}px;
  box-shadow: 0 0 15px 2px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  align-items: stretch;
  font-weight: bold;
  flex-direction: ${props => props.vertical && 'column'};

  &:hover {
    cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
    box-shadow: 0 0 20px 2px rgba(0, 0, 0, 0.15);
  }
`;

const Count = styledTS<{ color?: string }>(styled.div)`
  padding: 10px 15px;
  color: ${colors.colorWhite};
  background: ${props =>
    `linear-gradient(195deg, ${lighten(
      props.color || colors.colorPrimaryDark,
      40
    )} 0%, ${darken(props.color || colors.colorPrimaryDark, 20)} 100%);;`}
  display: flex;
  align-items: center;
  font-size: 16px;
`;

const Title = styled.div`
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
`;

const NotifyList = styled.ul`
  list-style: none;
  padding: 0;
  margin-bottom: 0;
`;

const NotifyItem = styled.li`
  margin-top: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid ${colors.borderPrimary};
  display: flex;
  flex-direction: row;

  > i {
    padding: 0 10px 0 0;
    color: ${colors.colorCoreBlue};
  }

  &:last-child {
    border: none;
  }
`;

export { GroupHead, Count, Title, NotifyList, NotifyItem };
