import { colors, dimensions } from 'modules/common/styles';
import styled from 'styled-components';

const imageSize = 30;

const Members = styled.div`
  padding-top: ${dimensions.unitSpacing - 5}px;
`;

const MemberImg = styled.img`
  width: ${imageSize}px;
  height: ${imageSize}px;
  border-radius: ${imageSize / 2}px;
  background: ${colors.bgActive};
  border: 2px solid ${colors.colorWhite};
  margin-left: -8px;

  &:first-child {
    margin-left: 0;
  }
`;

const More = styled(MemberImg.withComponent('span'))`
  color: ${colors.colorWhite};
  text-align: center;
  vertical-align: middle;
  font-size: ${dimensions.unitSpacing}px;
  background: ${colors.colorCoreLightGray};
  display: inline-block;
  line-height: ${dimensions.coreSpacing + 6}px;
  cursor: pointer;
`;

const TopHeader = styled.div`
  padding: 18px 20px;
`;

const Title = styled.div`
  font-size: 24px;
  margin: 20px 0;
  display: flex;
  line-height: 30px;
`;

export { MemberImg, Members, More, TopHeader, Title };
