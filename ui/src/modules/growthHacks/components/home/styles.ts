import { colors, dimensions } from 'modules/common/styles';
import { SimpleButton } from 'modules/common/styles/main';
import { BoxItem } from 'modules/settings/growthHacks/styles';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';

const BoxContainer = styled.div`
  display: flex;
  padding: 20px 0 20px 20px;
  flex-wrap: wrap;

  > a,
  > div {
    flex-basis: 20%;
    display: flex;
    flex-shrink: 0;

    @media (min-width: 480px) {
      flex-basis: 50%;
    }

    @media (min-width: 768px) {
      flex-basis: 33.3333333%;
    }

    @media (min-width: 1170px) {
      flex-basis: 25%;
    }

    @media (min-width: 1400px) {
      flex-basis: 20%;
    }
  }
`;

const ProjectItem = styledTS<{ new?: boolean }>(styled(BoxItem))`
  padding: 0;
  overflow: hidden;
  padding: 30px;
  flex: 1;
  border: 1px solid #eee;
  position: relative;
  color: ${colors.colorCoreDarkBlue};

  h5 {
    margin-bottom: ${dimensions.unitSpacing}px;
    color: ${colors.colorCoreDarkBlue};
    font-size: 30px;
    line-height: 32px;
    font-weight: 500;
    transition: opacity 0.3s ease;

    span {
      margin-left: 5px;
    }
  }

  &:before {
    content: '\\ec35';
    font-family: 'erxes';
    position: absolute;
    color: ${colors.colorCoreDarkBlue};
    font-size: 196px;
    transform: rotate(10deg);
    right: -15%;
    bottom: -80px;
    opacity: 0.06;
  }

  ${props =>
    props.new &&
    css`
      display: flex;
      justify-content: flex-end;
      border-style: dashed;
      border-width: 2px;

      &:before {
        content: '';
      }

      &:hover {
        border-color: ${colors.borderDarker};
        cursor: pointer;

        h5 {
          opacity: 0.4;
        }
      }

      h5 {
        opacity: 0.2;
        font-weight: bold;
        font-size: 40px;
        line-height: 44px;
      }
    `};
`;

const PipelineMeta = styled.div`
  font-size: 12px;
  color: ${colors.colorCoreGray};
  margin-top: 70px;

  i {
    margin-right: ${dimensions.unitSpacing / 2}px;
  }

  span {
    margin-bottom: 5px;
  }
`;

const CountItem = styledTS<{ content: string }>(styled(ProjectItem))`

  &:before {
    content: ${props => `'\\${props.content}'`};
    right: 0;
    bottom: -90px;
    transform: rotate(0deg);
  }

  > strong {
    font-size: 60px;
    margin-top: 30px;
    line-height: 1;
  }
`;

const FilterWrapper = styled.div`
  padding: 0 20px;
  margin: -20px 0 10px;
  position: sticky;
  top: 0;
  background: ${colors.colorWhite};
  z-index: 2;
`;

const HelperButtons = styled.div`
  position: absolute;
  right: 20px;
  top: 7px;
  z-index: 3;
  display: flex;
  align-items: center;
`;

const FilterButton = styled(SimpleButton)`
  width: auto;
  height: auto;
  padding: 5px 15px;
  border-radius: 20px;
  margin-left: 5px;
`;

export {
  BoxContainer,
  ProjectItem,
  PipelineMeta,
  CountItem,
  FilterWrapper,
  FilterButton,
  HelperButtons
};
