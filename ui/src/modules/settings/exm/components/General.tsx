import React, { useState } from 'react';
import Select from 'react-select-plus';

import { FormControl } from 'modules/common/components/form';
import { __ } from 'modules/common/utils';
import { FeatureRow, FeatureRowItem } from '../styles';

type Props = {
  forms: any[];
  kbTopics: any[];
};

export default function General(props: Props) {
  const getEmptyFeature = () => ({
    _id: Math.random().toString(),
    icon: '',
    contentType: 'form',
    name: '',
    description: '',
    contentId: ''
  });

  const [features, setFeatures] = useState([getEmptyFeature()]);

  const onChangeFeature = (type: String, _id?: string) => {
    if (type === 'add') {
      setFeatures([...features, getEmptyFeature()]);
    } else {
      const modifiedFeatures = features.filter(f => f._id !== _id);

      setFeatures(modifiedFeatures);
    }
  };

  const onChangeFeatureItem = (_id: string, name: string, value: any) => {
    const feature = features.find(f => f._id === _id);

    if (feature) {
      feature[name] = value;

      setFeatures([...features]);
    }
  };

  const getContentValues = (contentType: string) => {
    if (contentType === 'form') {
      return props.forms.map(f => ({ value: f._id, label: f.name }));
    }

    return props.kbTopics.map(c => ({ value: c._id, label: c.title }));
  };

  return (
    <>
      {features.map(feature => (
        <FeatureRow key={feature._id}>
          <FeatureRowItem>
            <FormControl
              componentClass="select"
              value={feature.contentType}
              options={[
                {
                  value: 'form',
                  label: 'Forms'
                },
                {
                  value: 'knowledgeBase',
                  label: 'Knowledge base'
                }
              ]}
              onChange={(e: any) =>
                onChangeFeatureItem(feature._id, 'contentType', e.target.value)
              }
            />
          </FeatureRowItem>
          <FeatureRowItem>
            <FormControl
              componentClass="select"
              value={feature.icon}
              options={[
                {
                  value: 'linkedin',
                  label: 'linkedin'
                },
                {
                  value: 'alarm-2',
                  label: 'Alarm 2'
                }
              ]}
              onChange={(e: any) =>
                onChangeFeatureItem(feature._id, 'icon', e.target.value)
              }
            />
          </FeatureRowItem>
          <FeatureRowItem>
            <FormControl
              name="name"
              placeholder="Name"
              value={feature.name}
              onChange={(e: any) =>
                onChangeFeatureItem(feature._id, 'name', e.target.value)
              }
            />
          </FeatureRowItem>
          <FeatureRowItem>
            <FormControl
              name="description"
              placeholder="Description"
              value={feature.description}
              onChange={(e: any) =>
                onChangeFeatureItem(feature._id, 'description', e.target.value)
              }
            />
          </FeatureRowItem>
          <FeatureRowItem>
            <Select
              placeholder={__('Choose a content')}
              value={feature.contentId}
              options={getContentValues(feature.contentType)}
              onChange={item =>
                onChangeFeatureItem(feature._id, 'contentId', item.value)
              }
              clearable={false}
            />
          </FeatureRowItem>

          <button onClick={() => onChangeFeature('remove', feature._id)}>
            X
          </button>
        </FeatureRow>
      ))}
      <button
        style={{ float: 'right', margin: 20 }}
        onClick={() => onChangeFeature('add')}
      >
        Add feature
      </button>
    </>
  );
}
