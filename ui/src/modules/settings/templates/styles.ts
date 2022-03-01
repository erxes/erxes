import { colors } from 'modules/common/styles';
import styled from 'styled-components';

const Info = styled.div`
  margin-top: 5px;
  white-space: normal;

  > span {
    font-weight: normal;
  }
`;

const InfoTitle = styled.span`
  font-weight: 500;
  margin-bottom: 5px;
  margin-right: 10px;
`;

const InfoDetail = styled.p`
  margin: 0;
  display: block;
  font-size: 12px;
  font-weight: normal;
  color: ${colors.colorCoreGray};
  word-break: break-all;
`;

const LinkButton = styled.a`
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const StageList = styled.div`
  background: ${colors.colorWhite};
  padding: 20px;
  margin-top: 10px;
  box-shadow: 0 2px 8px ${colors.shadowPrimary};

  ${LinkButton} {
    margin: 20px 0 0 30px;
    display: block;
  }
`;

const StageItemContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex: 1;
  background-color: ${colors.colorWhite};
  padding: 0;
  align-items: center;

  > *:not(button) {
    margin-right: 10px;
  }

  button {
    padding: 3px;
    font-size: 16px;
    margin: 0;
  }

  button:hover {
    color: ${colors.colorCoreRed};
  }
`;

export { InfoTitle, InfoDetail, Info, StageList, StageItemContainer };
