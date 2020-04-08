import { colors } from 'modules/common/styles';
import { __ } from 'modules/common/utils';
import React, { useState } from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { TEAM_FEATURES } from '../constants';

const Wrapper = styled.div``;

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 0 -5px;
`;

const Item = styled.div`
  flex-basis: 50%;
  display: flex;
`;

const TeamName = styledTS<{ chosen: boolean }>(styled.div)`
	border: 1px solid ${props => (props.chosen ? colors.colorPrimary : '#ddd')};
	padding: 8px 12px;
	margin: 5px
	flex: 1;
	border-radius: 4px;
	
	&:hover {
		cursor: pointer;
	}
`;

type Props = {
  renderButton: (text: string, onClick) => React.ReactNode;
};

function Customization(props: Props) {
  const [teams, setTeams] = useState<string[]>([]);

  const renderItem = item => {
    const isChosen = teams.includes(item.name);

    const toggleItem = () => {
      if (isChosen) {
        return setTeams(teams.filter(team => item.name !== team));
      }

      if (teams.length > 2) {
        return;
      }

      return setTeams([...teams, item.name]);
    };

    return (
      <Item key={item.name} onClick={toggleItem}>
        <TeamName chosen={isChosen}>{item.name}</TeamName>
      </Item>
    );
  };

  console.log(teams);
  return (
    <Wrapper>
      <h3>What team are you on?</h3>
      <p>
        erxes help large scope of area in the business. By knowing where you're
        in your business will help us to understand where you want to start with
        us. Let's get you the most out of erxes.
      </p>
      <p>You can choose maximum 3 of the below fields in priority order</p>
      <Container>{TEAM_FEATURES.map(team => renderItem(team))}</Container>
      {props.renderButton('Finish', () => {})}
    </Wrapper>
  );
}

export default Customization;
