import { colors } from '../styles';
import React from 'react';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';
import styled from 'styled-components';

const Wrapper = styled.div`
  line-height: 10px;
  .react-toggle--checked .react-toggle-track {
    width: 42px;
    background-color: ${colors.colorPrimaryDark};
  }
  
  .react-toggle-track:hover {
    background-color: ${colors.colorPrimaryDark};
  }

  .react-toggle-track {
    width: 42px;
    border: 3px solid ${colors.colorPrimaryDark};
    background-color: ${colors.colorWhite};
  }

  .react-toggle-track span {
    display: none;
  }
  
  .react-toggle-thumb{
    background: ${colors.colorPrimaryDark};
    height: 13px;
    width: 13px;
    margin: 4px;
  }

  .react-toggle--checked .react-toggle-thumb{
    background: ${colors.colorWhite};
    border-color: ${colors.colorPrimaryDark};
    height: 13px;
    width: 13px;
    margin: 4px 15px 0 0;
  }

  .react-toggle--checked:hover:not(.react-toggle--disabled)
    .react-toggle-track {
      border-color: ${colors.colorPrimaryDark};
      background-color: ${colors.colorPrimaryDark};
  }

  .react-toggle:hover:not(.react-toggle--disabled) .react-toggle-track {
    background-color: ${colors.colorWhite};
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
