import { colors } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import { __ } from 'modules/common/utils';
import React, { useState } from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { FEATURES } from '../../constants';
import { IFeatureEntry } from '../../types';
import { SubContent } from '../styles';

const Container = styled.div`
  width: 425px;
`;

const Features = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
`;

const FeatureName = styledTS<{ chosen: boolean }>(styled.div)`
  border: 1px solid ${props => (props.chosen ? colors.colorSecondary : '#ddd')};
  background: ${props => props.chosen && rgba(colors.colorSecondary, 0.1)};
	padding: 5px 16px;
	margin-bottom: 8px
	flex: 1;
  border-radius: 4px;
  transition: all 0.3s ease;
  color: ${props =>
    props.chosen ? colors.colorSecondary : colors.textPrimary};

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

    features.map(feature => {
      return featuresToSave.push(feature.key);
    });

    // save to localstorages
    localStorage.setItem(
      'erxes_customization_features',
      JSON.stringify(featuresToSave)
    );

    props.changeRoute('todoList');
  };

  const renderItem = (item: IFeatureEntry) => {
    const isChosen = features.includes(item);

    const toggleItem = () => {
      if (isChosen) {
        return setFeatures(
          features.filter(feature => item.key !== feature.key)
        );
      }

      return setFeatures([...features, item]);
    };

    return (
      <FeatureName
        id={`robot-item-${item.key}`}
        key={item.key}
        onClick={toggleItem}
        chosen={isChosen}
        dangerouslySetInnerHTML={{ __html: item.name }}
      />
    );
  };

  return (
    <Container>
      <SubContent>
        <h3>{__('Where do you want to start')}?</h3>
        <p>
          {__('There are a ton of things you can do with')}
          <strong> {__('erxes')}</strong>.
          {__(
            "Let's pick the place to start, and we'll help you to get the most out of it"
          )}
          .
        </p>
        <p>
          <i>
            {__('You can choose')} <strong>{__('at least two')} </strong>
            {__('fields in your priority order')}
          </i>
        </p>
      </SubContent>
      <Features id="robot-features">
        {FEATURES.map(feature => renderItem(feature))}
      </Features>
      {props.renderButton(
        __('Finish'),
        saveFeatures,
        'check-circle',
        features.length < 2
      )}
    </Container>
  );
}

export default Customization;
