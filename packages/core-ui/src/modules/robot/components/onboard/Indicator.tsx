import colors from 'modules/common/styles/colors';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { Flex } from '@erxes/ui/src/styles/main';

const Round = styledTS<{ active?: boolean }>(styled.div)`
	width: 8px;
	height: 8px;
	border-radius: 4px;
	background: ${colors.colorCoreRed};
	margin-right: 5px;
	transition: 0.3s transform ease;
	opacity:  ${props => (props.active ? '1' : '0.4')};;
	transform: ${props => props.active && 'scale(1.18)'};

	&:last-child {
		margin: 0;
	}
`;

type Props = {
  totalStep: number;
  activeStep?: number;
};

function Indicator(props: Props) {
  const { totalStep, activeStep } = props;

  return (
    <Flex>
      {Array.from(Array(totalStep)).map((item, index) => (
        <Round key={index} active={index === activeStep} />
      ))}
    </Flex>
  );
}

export default Indicator;
