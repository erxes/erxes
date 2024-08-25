import { colors, dimensions } from '@erxes/ui/src/styles';
import styled from 'styled-components';
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
