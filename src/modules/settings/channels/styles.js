import styled from 'styled-components';
import { colors, dimensions } from 'modules/common/styles';

const Members = styled.div`
  padding-top: ${dimensions.unitSpacing - 5}px;
`;

const MemberImg = styled.img`
  width: ${dimensions.coreSpacing + 10}px;
  border-radius: ${dimensions.unitSpacing + 5}px;
  border: 2px solid ${colors.colorWhite};
  margin-left: -8px;

  &:first-child {
    margin-left: 0;
  }
`;

const More = MemberImg.withComponent('span').extend`
  color: ${colors.colorWhite};
  text-align: center;
  vertical-align: middle;
  font-size: ${dimensions.unitSpacing}px;
  background: ${colors.colorCoreLightGray};
  display: inline-block;
  line-height: ${dimensions.coreSpacing + 6}px;
  cursor: pointer;
`;

export { MemberImg, Members, More };
