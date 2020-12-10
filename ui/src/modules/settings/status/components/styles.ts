import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors } from 'modules/common/styles';
import { Content, NavButton } from 'modules/robot/components/styles';

const VersionContainer = styledTS<{ isLatest?: boolean }>(styled.div)`
  padding: 3px 10px 3px 1.5rem;
  font-size: 11px;
  color: ${colors.colorCoreGray};

  i {
    color: ${props =>
      props.isLatest ? colors.colorCoreGreen : colors.colorCoreRed};
  }

  a {
    color: ${colors.colorCoreGray};

    &:hover {
      cursor: pointer;
      text-decoration: underline;
    }
  }
`;

const Button = styled.a`
  padding: 0px 10px;
  border-radius: 13px;
  color: ${colors.colorWhite};
  font-size: 11px;
  font-weight: 700;
  display: inline-block;
  line-height: 26px;
  text-transform: uppercase;
  margin-left: -10px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.16);
  }
`;

const Wrapper = styled.div`
  width: 250px;
  display: flex;
  margin: 0;

  > i {
    margin-right: 10px;
  }

  h3 {
    margin: 4px 0 10px 0;
    font-size: 16px;
  }

  p {
    margin-bottom: 10px;
    color: rgba(255, 255, 255, 0.9);

    a {
      text-decoration: underline;
      color: ${colors.colorWhite};
    }

    strong {
      font-weight: 500;
    }
  }
`;

const VersionNotifier = styled(Content)`
  background: ${colors.colorCoreBlue};
  color: ${colors.colorWhite};
  padding: 12px 16px;

  ${NavButton} {
    background: rgba(0, 0, 0, 0.1);
    color: ${colors.colorWhite};

    &:hover {
      background: rgba(0, 0, 0, 0.2);
    }
  }
`;

const ReleaseContainer = styled.div`
  padding: 30px;
  font-size: 16px;

  h2 {
    margin-top: 0;
    font-size: 1.5em;
    font-weight: 600;
  }

  h3 {
    font-size: 1.25em;
    margin-bottom: 15px;
    font-weight: 600;
    line-height: 1.25;
  }

  em {
    font-weight: bold;
    font-style: normal;
    margin-left: 10px;
  }
`;

export { VersionContainer, Button, Wrapper, VersionNotifier, ReleaseContainer };
