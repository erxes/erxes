import styled from 'styled-components';
import { dimensions, colors } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';

const FullContent = styled.div`
  flex: 1;
  display: flex;
  min-height: 100%;
  justify-content: ${props => props.center && 'center'};
  align-items: center;
`;

const BoxRoot = styled.div`
  text-align: center;
  display: inline-block;
  float: left;
  background: ${colors.colorLightBlue};
  box-shadow: 0 8px 5px ${rgba(colors.colorCoreGray, 0.08)};
  margin-right: ${dimensions.coreSpacing}px;
  margin-bottom: ${dimensions.coreSpacing}px;
  border-radius: ${dimensions.unitSpacing / 2}px;
  transition: all 0.25s ease;

  > a {
    display: block;
    padding: ${dimensions.coreSpacing}px;
    text-decoration: none;

    &:focus {
      text-decoration: none;
    }
  }

  img {
    width: 75px;
    transition: all 0.5s ease;
  }

  span {
    color: ${colors.colorCoreGray};
    display: block;
    margin-top: ${dimensions.unitSpacing}px;
  }

  &:hover {
    cursor: pointer;
    box-shadow: 0 10px 20px ${rgba(colors.colorCoreDarkGray, 0.12)};

    span {
      font-weight: 500;
    }

    img {
      transform: scale(1.1);
    }
  }

  @media (max-width: 780px) {
    width: 100%;
  }
`;

const ModalFooter = styled.div`
  text-align: right;
  margin-top: 40px;
`;

export { BoxRoot, FullContent, ModalFooter };
