import { colors } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import React, { useState } from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { FEATURES } from '../constants';
import { IFeatureEntry } from '../types';
import { SubContent } from './styles';

const Container = styled.div`
  width: 420px;
`;

const Features = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
`;

const FeatureName = styledTS<{ chosen: boolean }>(styled.div)`
  border: 1px solid ${props => (props.chosen ? colors.colorPrimary : '#ddd')};
  background: ${props => props.chosen && rgba(colors.colorPrimary, 0.1)};
	padding: 5px 16px;
	margin-bottom: 8px
	flex: 1;
  border-radius: 4px;
  
  &:last-child {
    margin-bottom: 0;
  }
	
	&:hover {
		cursor: pointer;
	}
`;

type Props = {
  renderButton: (
    text: string,
    onClick,
    icon: string,
    disabled: boolean
  ) => React.ReactNode;
  changeRoute: (route: string) => void;
};

function Customization(props: Props) {
  const [features, setFeatures] = useState<IFeatureEntry[]>([]);

  const saveFeatures = () => {
    const featuresToSave: string[] = [];

    features.map(category => {
      return featuresToSave.push(category.key);
    });

    // save to localstorages
    localStorage.setItem(
      'erxesCustomizationTeams',
      JSON.stringify(featuresToSave)
    );

    props.changeRoute('todoList');
  };

  const renderItem = (item: IFeatureEntry) => {
    const isChosen = features.includes(item);

    const toggleItem = () => {
      if (isChosen) {
        return setFeatures(
          features.filter(category => item.name !== category.name)
        );
      }

      return setFeatures([...features, item]);
    };

    return (
      <FeatureName key={item.name} onClick={toggleItem} chosen={isChosen}>
        {item.name}
      </FeatureName>
    );
  };

  return (
    <Container>
      <SubContent>
        <h3>Where do you want to start?</h3>
        <p>
          There are a tons of you can do with <strong>erxes</strong>. Let's pick
          the place to start, and we'll help you to get the most out of it.
        </p>
        <p>
          You can choose <strong>at least two</strong> of the below fields in
          priority order
        </p>
      </SubContent>
      <Features>{FEATURES.map(team => renderItem(team))}</Features>
      {props.renderButton(
        'Finish',
        saveFeatures,
        'check-circle',
        features.length < 2
      )}
    </Container>
  );
}

export default Customization;
