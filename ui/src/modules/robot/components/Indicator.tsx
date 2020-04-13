import colors from 'modules/common/styles/colors';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const Wrapper = styled.div`
  display: flex;
`;

const Round = styledTS<{ active?: boolean }>(styled.div)`
	width: 10px;
	height: 10px;
	border-radius: 5px;
	background: ${colors.colorCoreRed};
	margin-right: 5px;
	transition: 0.3s transform ease;
	opacity:  ${props => (props.active ? '1' : '0.5')};;
	transform: ${props => props.active && 'scale(1.14)'};

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
    <Wrapper>
      {Array.from(Array(totalStep)).map((item, index) => (
        <Round key={index} active={index === activeStep} />
      ))}
    </Wrapper>
  );
}

export default Indicator;
