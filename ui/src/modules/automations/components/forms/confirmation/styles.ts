import styled from 'styled-components';
import { colors, dimensions } from 'modules/common/styles';

export const IconWrapper = styled.div`
  font-size: 40px;
  color: ${colors.colorSecondary};
`;

export const ModalFooter = styled.div`
  padding: 10px ${dimensions.coreSpacing}px;
  background: ${colors.colorWhite};
  border-top: 1px solid ${colors.borderPrimary};
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  display: flex;
  justify-content: center;
`;

export const ModalBody = styled.div`
  text-align: center;
  padding: ${dimensions.coreSpacing}px;
  font-size: 15px;
  font-weight: 500;

  label {
    margin-top: ${dimensions.coreSpacing}px;
    font-size: 12px;
    color: #777;

    strong {
      color: ${colors.textPrimary};
    }
  }
`;
