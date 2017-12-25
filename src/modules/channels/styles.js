import styled from 'styled-components';
import { colors } from '../common/styles';

const SidebarListli = styled.li`
  border-top: 1px solid ${colors.borderPrimary};
`;

const Members = styled.div`
  padding: 0 20px 6px;
`;

const MemberImg = styled.img`
  width: 25px;
  border-radius: 13px;
  margin-right: 5px;
`;

export { SidebarListli, MemberImg, Members };
