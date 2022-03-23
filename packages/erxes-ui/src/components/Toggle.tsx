import { colors } from '../styles';
import React from 'react';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';
import styled from 'styled-components';

const Wrapper = styled.div`
  line-height: 10px;
  .react-toggle--checked .react-toggle-track {
    background-color: ${colors.colorPrimaryDark};
  }
  
  .react-toggle-track:hover {
    background-color: ${colors.colorPrimaryDark};
  }
  .react-toggle-track {
    border: 1px solid ${colors.colorPrimaryDark};
    background-color: ${colors.colorWhite};
  }
  .react-toggle-track span {
    display: none;
  }
  .react-toggle--checked .react-toggle-thumb{
    border-color: ${colors.colorPrimaryDark};
  }
  .react-toggle--checked:hover:not(.react-toggle--disabled)
    .react-toggle-track {
      border-color: ${colors.colorPrimaryDark};
      background-color: ${colors.colorPrimaryDark};
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
