import { colors } from 'modules/common/styles';
import React, { useState } from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { FEATURE_CATEGORIES } from '../constants';
import { IFeatureCategory } from '../types';

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
  renderButton: (
    text: string,
    onClick,
    icon: string,
    disabled: boolean
  ) => React.ReactNode;
  changeRoute: (route: string) => void;
};

function Customization(props: Props) {
  const [categories, setCategories] = useState<IFeatureCategory[]>([]);

  const saveCategories = () => {
    let mergedFeatures: string[] = [];

    categories.map(category => {
      return (mergedFeatures = mergedFeatures.concat(category.features));
    });

    // remove duplicated features and save to localstorages
    localStorage.setItem(
      'erxesCustomizationTeams',
      JSON.stringify(
        mergedFeatures.filter(
          (item, pos) => mergedFeatures.indexOf(item) === pos
        )
      )
    );

    props.changeRoute('todoList');
  };

  const renderItem = (item: IFeatureCategory) => {
    const isChosen = categories.includes(item);

    const toggleItem = () => {
      if (isChosen) {
        return setCategories(
          categories.filter(category => item.name !== category.name)
        );
      }

      if (categories.length > 2) {
        return;
      }

      return setCategories([...categories, item]);
    };

    return (
      <Item key={item.name} onClick={toggleItem}>
        <TeamName chosen={isChosen}>{item.name}</TeamName>
      </Item>
    );
  };

  return (
    <>
      <h3>What team are you on?</h3>
      <p>
        erxes help large scope of area in the business. By knowing where you're
        in your business will help us to understand where you want to start with
        us. Let's get you the most out of erxes.
      </p>
      <p>
        You can choose <strong>maximum 3</strong> of the below fields in
        priority order
      </p>
      <Container>{FEATURE_CATEGORIES.map(team => renderItem(team))}</Container>
      {props.renderButton(
        'Finish',
        saveCategories,
        'check-circle',
        categories.length === 0
      )}
    </>
  );
}

export default Customization;
