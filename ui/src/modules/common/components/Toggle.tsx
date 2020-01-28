import { colors } from 'modules/common/styles';
import React from 'react';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';
import styled from 'styled-components';

const Wrapper = styled.div`
  .react-toggle--checked .react-toggle-track {
    background-color: ${colors.colorCoreGreen};
  }

  .react-toggle-track {
    background-color: ${colors.colorCoreBlack};
  }

  .react-toggle-track span {
    display: none;
  }

  .react-toggle--checked .react-toggle-thumb,
  .react-toggle--checked:hover:not(.react-toggle--disabled)
    .react-toggle-track {
    border-color: ${colors.colorCoreGreen};
  }
`;

type Props = {
  value?: string;
  name?: string;
  id?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  'aria-labelledby'?: string;
  'aria-label'?: string;
  onFocus?: (e: React.FormEvent) => void;
  onBlur?: (e: React.FormEvent) => void;
  disabled?: boolean;
  onChange?: (e: React.FormEvent) => void;
  icons?: any;
};

export default (props: Props) => (
  <Wrapper>
    <Toggle {...props} />
  </Wrapper>
);
