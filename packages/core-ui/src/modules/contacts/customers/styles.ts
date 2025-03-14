import { colors } from '@erxes/ui/src/styles';
import styled from "styled-components";

const VerticalRightSidebar = styled.div`
    display: flex;
`;

const RightSide = styled.div`
    width: 80px;
    border-left: 1px solid ${colors.borderPrimary};
`;

const LeftSide = styled.div`
    width: 340px;
    overflow: auto;
`;

export {
    VerticalRightSidebar,
    RightSide,
    LeftSide
}