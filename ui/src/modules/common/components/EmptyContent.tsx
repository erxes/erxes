import { __ } from 'modules/common/utils';
import React from 'react';
import styled from 'styled-components';
import { colors } from '../styles';

const Container = styled.div`
  display: flex;
  height: 100%;
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 20px 40px;
	background: ${colors.bgLight};
`;

const Items = styled.div`
	display: flex;
	flex-wrap: wrap;
	margin-top: -40px;
`;

const ItemContent = styled.div`
	background: ${colors.colorWhite};
	padding: 20px;
	border-radius: 5px;
	box-shadow: 0 0 6px 1px rgba(0,0,0,0.08);
	margin: 10px;
	min-width: 200px;
	flex: 1;
	position: relative;

	h4 {
		margin: 20px 0 10px;
		font-size: 16px;
		font-weight: 700;
	}

	p {
		margin: 0;
	}
	
	&:before {
		content: attr(data-order);
		line-height: 30px;
		background: #fff;
		width: 30px;
		text-align: center;
		box-shadow: 0 0 6px 1px rgba(0,0,0,0.08);
		border-radius: 15px;
		font-weight: 800;
		display: block;
	}
`;

type Props = {
  steps?: any[];
};

function EmptyContent({ steps }: Props) {
  return (
    <Container>
			<Items>
				<ItemContent data-order="1">
					<h4>Setup your brand</h4>
					<p>Nothing goes missing around here.</p>
				</ItemContent>
				<ItemContent data-order="2">qweqweqwe</ItemContent>
				<ItemContent data-order="3">qweqweqwe</ItemContent>
				
				<ItemContent data-order="4">item asdjb ajksd kajsb dkajbs dkjabd</ItemContent>
			</Items>
		</Container>
  );
}

export default EmptyContent;
