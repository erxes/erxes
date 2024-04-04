import { ControlLabel, FormControl } from '@erxes/ui/src/components/form';
import {
  FeatureLayout,
  FeatureRow,
  FeatureRowItem,
  GeneralWrapper,
  TeamPortal
} from '../styles';
import React, { useState } from 'react';
import { generateTree, removeTypename } from '../utils';

import Button from '@erxes/ui/src/components/Button';
import { IExm } from '../types';
import Select from 'react-select-plus';
import { __ } from '@erxes/ui/src/utils';

const getEmptyFeature = () => ({
  _id: Math.random().toString(),
  name: '',
  description: '',
  contentId: '',
  subContentId: ''
});

type Props = {
  exm: IExm;
  edit: (variables: IExm) => void;
  kbTopics: any[];
  kbCategories: { [key: string]: any[] };
  getKbCategories: (topicId: string) => void;
};

export default function General(props: Props) {
  const { kbTopics, exm, edit, getKbCategories, kbCategories } = props;
  const exmFeatures = exm.features || [];

  const [name, setName] = useState(exm.name || '');
  const [description, setDescription] = useState(exm.description || '');
  const [features, setFeatures] = useState(
    exmFeatures.length > 0 ? removeTypename(exmFeatures) : [getEmptyFeature()]
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

  const getContentValues = () => {
    return kbTopics.map(c => ({ value: c._id, label: c.title }));
  };

  const getCategoryValues = (contentId, categories, parentId) => {
    if (!categories) {
      getKbCategories(contentId);

      return [];
    } else {
      return generateTree(
        categories,
        parentId,
        node => ({
          value: node._id,
          label: `${node.parentCategoryId ? '---' : ''} ${node.title}`
        }),
        'parentCategoryId'
      );
    }
  };

  const onSave = () => {
    edit({ _id: exm._id, name, description, features });
  };

  return (
    <GeneralWrapper>
      <TeamPortal>
        <p>Team portal</p>
        <FeatureRow>
          <FeatureRowItem>
            <ControlLabel>{__('Name your team portal')}</ControlLabel>
            <FormControl
              value={name}
              placeholder="Name"
              onChange={(e: any) => setName(e.target.value)}
            />
          </FeatureRowItem>
          <FeatureRowItem>
            <ControlLabel>{__('Describe your team portal')}</ControlLabel>
            <FormControl
              value={description}
              placeholder="Description"
              onChange={(e: any) => setDescription(e.target.value)}
            />
          </FeatureRowItem>
        </FeatureRow>
      </TeamPortal>
      <FeatureLayout>
        <p>Features</p>
        {features.map(feature => (
          <FeatureRow key={feature._id}>
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
                  onChangeFeatureItem(
                    feature._id,
                    'description',
                    e.target.value
                  )
                }
              />
            </FeatureRowItem>
            <FeatureRowItem>
              <Select
                placeholder={__(`Choose a knowledge base`)}
                value={feature.contentId}
                options={getContentValues()}
                onChange={item => {
                  getKbCategories(item.value);

                  onChangeFeatureItem(feature._id, 'contentId', item.value);
                }}
                clearable={false}
              />
            </FeatureRowItem>

            <FeatureRowItem>
              <Select
                placeholder={__('Choose a category')}
                value={feature.subContentId}
                options={getCategoryValues(
                  feature.contentId,
                  kbCategories[feature.contentId],
                  null
                )}
                style={{ width: 200 }}
                onChange={item =>
                  onChangeFeatureItem(feature._id, 'subContentId', item.value)
                }
                clearable={false}
              />
            </FeatureRowItem>

            <Button
              btnStyle="danger"
              onClick={() => onChangeFeature('remove', feature._id)}
            >
              X
            </Button>
          </FeatureRow>
        ))}
        <Button onClick={() => onChangeFeature('add')}>+ Add Features</Button>
      </FeatureLayout>
      <Button btnStyle="success" onClick={onSave}>
        Save
      </Button>
    </GeneralWrapper>
  );
}
