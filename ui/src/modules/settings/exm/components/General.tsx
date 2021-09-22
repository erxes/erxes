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
  kbCategories: any;
  getKbCategories: (topicId: string) => void;
};

export default function General(props: Props) {
  const { forms, kbTopics, exm, edit, getKbCategories, kbCategories } = props;

  const exmFeatures = exm.features || [];

  const [name, setName] = useState(exm.name || '');
  const [description, setDescription] = useState(exm.description || '');
  const [features, setFeatures] = useState(
    exmFeatures.length > 0 ? exmFeatures : [getEmptyFeature()]
  );

  const onChangeFeature = (type: string, _id?: string) => {
    if (type === 'add') {
      setFeatures([...features, getEmptyFeature()]);
    } else {
      const modifiedFeatures = features.filter(f => f._id !== _id);

      setFeatures(modifiedFeatures);
    }
  };

  const onChangeFeatureItem = (_id: string, key: string, value: any) => {
    const feature = features.find(f => f._id === _id);

    if (feature) {
      feature[key] = value;

      setFeatures([...features]);
    }
  };

  const getContentValues = (contentType: string) => {
    if (contentType === 'form') {
      return forms.map(f => ({ value: f._id, label: f.name }));
    }

    return kbTopics.map(c => ({ value: c._id, label: c.title }));
  };

  const getCategoryValues = (categories, parentId, level = 0) => {
    return categories
      .filter(c => c.parentCategoryId === parentId)
      .reduce(
        (tree, node) => [
          ...tree,
          {
            value: node._id,
            label: `${node.parentCategoryId ? '---' : ''} ${node.title}`
          },
          ...getCategoryValues(categories, node._id, level++)
        ],
        []
      );
  };

  const onSave = () => {
    edit({ _id: exm._id, name, description, features });
  };

  return (
    <div style={{ padding: 50 }}>
      <FormControl
        value={name}
        placeholder="Name"
        onChange={(e: any) => setName(e.target.value)}
      />
      <br />
      <FormControl
        value={description}
        componentClass="textarea"
        placeholder="Description"
        onChange={(e: any) => setDescription(e.target.value)}
      />
      <br />
      <h3>Features</h3>
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
              onChange={(e: any) => {
                onChangeFeatureItem(feature._id, 'contentType', e.target.value);
              }}
            />
          </FeatureRowItem>
          <FeatureRowItem>
            <FormControl
              componentClass="select"
              value={feature.icon}
              options={[
                {
                  value: 'mic-line',
                  label: 'mic-line'
                },
                {
                  value: 'movie-2-line',
                  label: 'movie-2-line'
                },
                {
                  value: 'survey-line',
                  label: 'survey-line'
                },
                {
                  value: 'hand-heart-line',
                  label: 'hand-heart-line'
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
              componentClass="textarea"
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
              onChange={item => {
                if (feature.contentType === 'knowledgeBase') {
                  getKbCategories(item.value);
                }

                onChangeFeatureItem(feature._id, 'contentId', item.value);
              }}
              clearable={false}
            />
          </FeatureRowItem>

          {feature.contentType === 'knowledgeBase' && (
            <FeatureRowItem>
              <Select
                placeholder={__('Choose a category')}
                value={feature.categoryId}
                options={getCategoryValues(
                  kbCategories[feature.contentId] || [],
                  null
                )}
                style={{ width: 200 }}
                onChange={item =>
                  onChangeFeatureItem(feature._id, 'categoryId', item.value)
                }
                clearable={false}
              />
            </FeatureRowItem>
          )}

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
    </div>
  );
}
