import { colors, dimensions } from '@erxes/ui/src/styles';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { ITest } from '../types';

const TestNameStyled = styledTS<{ checked: boolean }>(styled.div).attrs({})`
    color: ${colors.colorCoreBlack};
    text-decoration: ${props => (props.checked ? 'line-through' : 'none')}
    `;

type Props = {
  test: ITest;
  checked: boolean;
};

function Tests({ test, checked }: Props) {
  return <TestNameStyled checked={checked}>{test.name}</TestNameStyled>;
}

export default Tests;
