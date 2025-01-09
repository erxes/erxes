import colors from '@erxes/ui/src/styles/colors';
import dimensions from '@erxes/ui/src/styles/dimensions';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const DropdownContent = styled.div`
    display: flex;

    > div {
      border-right: 1px solid ${colors.borderPrimary};
      margin: ${dimensions.unitSpacing}px 0;
      min-width: 170px;

      &:last-child: 0;
    }

    h3 {
      font-size: 14px;
      text-align: left;
      padding: ${dimensions.unitSpacing}px 15px;
      font-weight: 700;
      margin: 0;
    }

    li {
      font-weight: 400;
    }
`;

export const TransactionLinkWrapper = styled.div`
    position: relative;

    div.absolute {
      right: auto;
      left: -${dimensions.headerSpacingWide + dimensions.coreSpacing}px;
    }
`;

export const DeleteIcon = styled.span`
  margin-left: ${dimensions.unitSpacing - 5}px;
`;

export const ContentWrapper = styled.div`
  position: relative;
  padding: ${dimensions.coreSpacing}px ${dimensions.coreSpacing + dimensions.unitSpacing}px;
`;

export const FormContent = styled.div`
  border-radius: ${dimensions.unitSpacing}px;
  border: 1px solid ${colors.borderPrimary};
`

export const FormContentHeader = styled.div`
  padding: 0 ${dimensions.coreSpacing}px;
  border-bottom: 1px solid ${colors.borderPrimary};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const PtrContent = styled.div`
    .odd {
      background: ${colors.bgLightPurple};

      .odd-td {
        text-align: left;
        font-weight: 600;
      }

      &:hover td {
        background-color: ${colors.bgLightPurple};
      }
    }
`;