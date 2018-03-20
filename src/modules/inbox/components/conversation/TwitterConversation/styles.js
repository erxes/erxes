import styled from 'styled-components';
import { colors } from 'modules/common/styles';

const mainSize = '20px';
const borderRadius = '4px';

const Tweet = styled.div`
  padding: ${mainSize} ${mainSize} 15px 70px;
  padding-left: ${props => props.root && mainSize};
  border: 1px solid ${colors.borderDarker};
  overflow: hidden;
  position: relative;
  margin-bottom: ${mainSize};
  background: ${props => props.root && colors.colorWhite};
  border-radius: ${borderRadius};

  > span {
    position: absolute;
    left: ${mainSize};
    top: ${mainSize};
  }

  img {
    margin-bottom: 15px;
    max-width: 100%;
    border-radius: ${borderRadius};
  }
`;

const User = styled.div`
  color: ${colors.colorCoreGray};
  position: relative;
  padding-right: ${mainSize};
  padding-left: ${props => props.root && '50px'};
  margin-bottom: ${props => props.root && '10px'};

  > span {
    display: ${props => props.root && 'block'};

    &:before {
      content: ${props => !props.root && '• '};
    }
  }
`;

const Time = styled.a`
  color: ${colors.colorCoreGray};
  position: absolute;
  right: 0;
  top: 0;
  cursor: pointer;
`;

const Counts = styled.div`
  color: ${colors.colorCoreGray};
  font-size: 12px;
  border-top: ${props => props.root && `1px solid ${colors.borderPrimary}`};
  padding-top: ${props => props.root && '15px'};

  i {
    font-size: 14px;
    margin-right: 3px;
  }
`;

const Reply = styled.div`
  color: ${colors.colorCoreGray};
`;

const Count = styled.span`
  margin-right: ${mainSize};
  transition: color ease 0.3s;

  &:hover {
    cursor: pointer;
    color: ${colors.colorCoreBlack};
  }

  color: ${props => props.favorited && colors.colorCoreRed};
  color: ${props => props.retweeted && colors.colorCoreGreen};
`;

export { Tweet, User, Time, Counts, Count, Reply };
