import React, { useState } from 'react';
import Select from 'react-select-plus';

import { FormControl } from 'modules/common/components/form';
import { __ } from 'modules/common/utils';
import { FeatureRow, FeatureRowItem } from '../styles';
import Button from 'modules/common/components/Button';

const getEmptyFeature = () => ({
  _id: Math.random().toString(),
  icon: 'reply',
  contentType: 'form',
  name: '',
  description: '',
  contentId: ''
});

type Props = {
  exm: any;
  edit: (variables: any) => void;
  forms: any[];
  kbTopics: any[];
};

export default function General(props: Props) {
  const { forms, kbTopics, exm, edit } = props;

  const [features, setFeatures] = useState(exm.features || [getEmptyFeature()]);

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
      return forms.map(f => ({ value: f._id, label: f.name }));
    }

    return kbTopics.map(c => ({ value: c._id, label: c.title }));
  };

  const onSave = () => {
    edit({ _id: exm._id, features });
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
                  value: 'reply',
                  label: 'reply'
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
      <button onClick={() => onChangeFeature('add')}>+</button>
      <br />
      <Button style={{ float: 'right', marginRight: '20px' }} onClick={onSave}>
        Save
      </Button>
    </>
  );
}
