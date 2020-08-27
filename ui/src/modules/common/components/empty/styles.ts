import { darken, rgba } from 'modules/common/styles/color';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors, dimensions } from '../../styles';

const Container = styled.div`
  display: flex;
  min-height: 100%;
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${dimensions.coreSpacing}px ${dimensions.coreSpacing * 2}px;
	background: ${colors.bgLight};
	flex-direction: column;

	h2 {
		margin: 0px 0 ${dimensions.unitSpacing}px;
		font-weight: 700;
		text-align: center;
	}

	> p {
		font-size: 16px;
		text-align: center;
		color: ${colors.colorCoreGray};
		max-width: 65%;

		@media (max-width: 1170px) {
			max-width: 100%;
		}
	}
`;

const Items = styledTS<{ vertical?: boolean }>(styled.div)`
	display: flex;
	flex-wrap: wrap;
	flex-direction: ${props => props.vertical ? 'column' : 'row'};
`;

const Action = styled.div`
	margin-top: auto;

	button, a {
		&:active, &:focus {
			box-shadow: none;
		}
	}
`;

const ItemContent = styledTS<{ color: string, vertical?: boolean; max?:string }>(styled.div)`
	background: ${props => rgba(props.color, 0.2)};
	padding: 25px 30px;
	border-radius: 5px;
	margin: 10px;
	min-width: 240px;
	max-width: ${props => props.vertical ? '420px' : props.max};
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	border: 1px solid transparent;
	position: relative;
	transition: background 0.3s ease;

	h4 {
		margin: ${dimensions.coreSpacing}px 0 ${dimensions.unitSpacing}px;
		font-size: 16px;
		font-weight: 700;
		line-height: 20px;
	}

	${Action} > button, ${Action} > a {
		background: ${props => props.color};
		
		&:hover {
			background: ${props => darken(props.color, 15)};
		}
	}

	p {
		margin: 0 0 20px;
	}

	strong {
		font-weight: 600;
	}

	ul {
		padding-left: ${dimensions.coreSpacing}px;
		margin: 0;

		li {
			margin-bottom: 5px;

			&:last-child {
				margin: 0;
			}
		}
	}
	
	> i {
		line-height: 32px;
		background: ${colors.colorWhite};
		width: 32px;
		text-align: center;
		box-shadow: 0 0 6px 1px rgba(0,0,0,0.08);
		border-radius: 16px;
		font-weight: 800;
		display: block;
		font-style: normal;
	}

	&:hover {
		background: ${props => rgba(props.color, 0.3)};
		border-color: ${props => props.color};
	}
`;

export { Container, Items, Action, ItemContent };

