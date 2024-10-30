import { Checkbox } from '@erxes/ui/src/components/form/styles';
import { colors, dimensions } from '@erxes/ui/src/styles';
import { FlexCenter } from '@erxes/ui/src/styles/main';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';

export const InlineItems = styled.div`
  display: flex;
  margin-bottom: ${dimensions.unitSpacing}px;
  align-items: center;
  justify-content: space-between;

  padding: 12px 24px;
  border-radius: 15px;
  border: 1px solid ${colors.borderPrimary};

  > p {
    display: flex;
    flex-direction: column;
    gap: 2px;

    > i {
      display: flex;
      justify-content: center;
    }

    > span {
      font-size: 10px;
      color: ${colors.colorLightGray};
    }
  }

  > div {
    margin-right: ${dimensions.unitSpacing}px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;

    > button {
      padding: 7px 11px;
      border-radius: 50%;
    }
  }
`;

export const ModuleBox = styled.div`
  padding-bottom: ${dimensions.coreSpacing}px;
`;

export const Box = styled.div`
  padding: ${dimensions.coreSpacing}px;
  padding-bottom: 0;
  background: ${colors.colorWhite};
  margin-bottom: ${dimensions.unitSpacing}px;

  &:last-of-type {
    margin: 0;
  }
`;

export const ModuleContentWrapper = styled.div`
  position: relative;
`;

export const ModuleContent = styledTS<{ isToggled: boolean }>(styled.span)`
  transition: all ease .3s;
  filter: ${props => !props.isToggled && `blur(4px)`};
  pointer-events: ${props => !props.isToggled && `none`};
    
    `;

export const ModuleContentMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  top: calc(100% / 2);
  left: calc(80% / 2);
`;

const MessageContent = styled(FlexCenter)`
  margin-top: 7px;
  line-height: 18px;
`;

export const RowItem = styledTS<{
  $isActive?: boolean;
  $isRead?: boolean;
}>(styled.li)`
  padding: ${dimensions.coreSpacing}px;
  display: flex;
  position: relative;
  flex-direction: row;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  transition: all ease 0.3s;
  background: ${props => (props.$isActive ? 'rgba(242,245,245,0.8)' : null)};

  ${props =>
    !props.$isRead &&
    css`
      background: ${colors.bgUnread};
      border-top: 1px solid rgba(0, 0, 0, 0.05);
      border-left: 1px solid ${colors.colorSecondary};
      margin-top: -1px;

      ${MessageContent} {
        font-weight: 700;
      }
    `};
  &:hover {
    background: ${props =>
      !props.$isRead || props.$isActive ? '' : colors.bgLight};
    cursor: pointer;
  }
`;

export const RowContent = styledTS<{ $isChecked?: boolean }>(styled.div)`
  flex: 1;
  display: flex;
  flex-direction: row;
  max-width: 100%;
  transition: all ease 0.3s;
  position: relative;
  padding-left: ${props => props.$isChecked && '30px'};

  &:hover {
    padding-left: 30px;

    ${Checkbox} {
      width: 30px;
    }
  }

  ${Checkbox} {
    width: ${props => (props.$isChecked ? '30px' : '0')};
    margin: 0;
    overflow: hidden;
    transition: all ease 0.3s;

    > label {
      margin-top: 7px;
    }
  }
`;
