import { colors, dimensions } from '@erxes/ui/src/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { RowTitle } from '@erxes/ui-settings/src/main/styles';

export const StyledUrl = styled.div`
  color: ${colors.colorCoreGray};
  font-weight: normal;
  font-size: 0.8rem;
`;

export const FlexRow = styled.div`
  flex: 1;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;

  > div:first-child {
    padding-right: ${dimensions.coreSpacing}px;
  }
`;

export const ButtonWrap = styled.div`
  text-align: right;
`;

export const ColorChooserTile = styled.div`
  margin-bottom: ${dimensions.unitSpacing - 5}px;
  font-size: 12px;
`;

export const ColorPickerWrap = styled.div`
  display: flex;
  flex: 1;
  margin-top: ${dimensions.unitSpacing}px;

  > div {
    padding-right: ${dimensions.coreSpacing + dimensions.unitSpacing}px;
    margin-bottom: 0;
  }
`;

export const IconWrap = styled.div`
  i {
    cursor: pointer;
  }
`;

export const Content = styled.div`
  padding: ${dimensions.coreSpacing}px;
`;

export const Block = styled.div`
  border-bottom: 1px dashed ${colors.borderPrimary};
  margin-bottom: ${dimensions.coreSpacing + dimensions.unitSpacing}px;
  padding-bottom: ${dimensions.unitSpacing}px;

  .Select {
    min-width: 300px;
  }

  > h4 {
    margin-bottom: ${dimensions.coreSpacing}px;
    color: ${colors.colorPrimary};
  }
`;

export const BlockRow = styled(FlexRow)`
  align-items: center;
  margin-bottom: ${dimensions.unitSpacing}px;

  > div {
    padding-right: ${dimensions.coreSpacing}px;
    width: 25%;

    &.description {
      width: 50%;
    }

    @media (max-width: 1250px) {
      flex: 1;
    }
  }
`;

export const BlockRowTitle = styled(RowTitle)`
  width: 150px;
  margin: 0;
`;

export const ToggleWrap = styled.div`
  width: 180px !important;

  > div > div {
    margin-top: ${dimensions.unitSpacing}px;
  }
`;

export const LogoWrapper = styled.div`
  > div > div {
    width: ${dimensions.coreSpacing}%;
  }
`;

export const Features = styledTS<{ isToggled: boolean }>(styled.span)`
  > div > div {
    width: 300px;
  }

  display: flex;
  flex: 1;
  transition: all ease .3s;
  filter: ${props => !props.isToggled && `blur(4px)`};
  pointer-events: ${props => !props.isToggled && `none`};
`;

export const Action = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: ${dimensions.unitSpacing}px;
`;

export const Name = styledTS<{ fontSize?: number }>(styled.div)`
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
