import styled from 'styled-components';
import { colors } from '../common/styles';

const SidebarListli = styled.li`
  border-top: 1px solid ${colors.borderPrimary};
`;

const Members = styled.div`
  padding: 0 20px 6px;
`;

const MemberImg = styled.img`
  width: 30px;
  border-radius: 15px;
  border: 2px solid ${colors.colorWhite};
  margin-left: -8px;
`;

const More = MemberImg.withComponent('span').extend`
  color: ${colors.colorWhite};
  text-align: center;
  vertical-align: middle;
  font-size: 10px;
  background: ${colors.colorCoreLightGray};
  display: inline-block;
  line-height: 28px;
  cursor: pointer;
`;

const RightButton = styled.div`
  position: absolute;
  right: 20px;
  top: 16px;
`;

const SearchField = styled.div`
  display: inline-block;
  margin-right: 10px;

  input {
    padding: 5px 16px;
    height: auto;
    font-size: 10px;
  }
`;

export { SidebarListli, MemberImg, Members, More, SearchField, RightButton };
