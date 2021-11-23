import React, { useState } from 'react';
import Select from 'react-select-plus';
import { ControlLabel, FormControl } from 'modules/common/components/form';
import { __ } from 'modules/common/utils';
import {
  FeatureRow,
  FeatureRowItem,
  FeatureLayout,
  GeneralWrapper,
  TeamPortal
} from '../styles';
import Button from 'modules/common/components/Button';
import { ICON_OPTIONS, TYPE_OPTIONS } from '../constants';
import { generateTree } from 'modules/settings/team/utils';
import { IExm } from '../types';
import { IIntegration } from 'modules/settings/integrations/types';
import { ICategory, ITopic } from 'modules/knowledgeBase/types';
import { removeTypename } from '../utils';

const getEmptyFeature = () => ({
  _id: Math.random().toString(),
  icon: 'reply',
  contentType: 'form',
  name: '',
  description: '',
  contentId: '',
  subContentId: ''
});

type Props = {
  exm: IExm;
  edit: (variables: IExm) => void;
  forms: IIntegration[];
  kbTopics: ITopic[];
  kbCategories: { [key: string]: ICategory[] };
  getKbCategories: (topicId: string) => void;
};

export default function General(props: Props) {
  const { forms, kbTopics, exm, edit, getKbCategories, kbCategories } = props;
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

  const getContentValues = (contentType: string) => {
    if (contentType === 'form') {
      return forms.map(f => ({ value: f._id, label: f.name }));
    }

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
                componentClass="select"
                value={feature.contentType}
                options={TYPE_OPTIONS}
                onChange={(e: any) => {
                  onChangeFeatureItem(
                    feature._id,
                    'contentType',
                    e.target.value
                  );
                }}
              />
            </FeatureRowItem>
            <FeatureRowItem>
              <FormControl
                componentClass="select"
                value={feature.icon}
                options={ICON_OPTIONS}
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
            )}

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
