import React, { useState } from 'react';
import Select from 'react-select-plus';
import { ControlLabel, FormControl } from '@erxes/ui/src/components/form';
import { __ } from '@erxes/ui/src/utils';
import {
  FeatureRow,
  FeatureRowItem,
  FeatureLayout,
  GeneralWrapper,
  TeamPortal
} from '../styles';
import Button from '@erxes/ui/src/components/Button';
import { ICON_OPTIONS, TYPE_OPTIONS } from '../constants';
import { IExm } from '../types';
import { generateTree, removeTypename } from '../utils';

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
  brands: any[];
  forms: any[];
  kbTopics: any[];
  kbCategories: { [key: string]: any[] };
  getKbCategories: (topicId: string) => void;
  getForms: (brandId: string) => void;
};

export default function General(props: Props) {
  const {
    forms,
    brands,
    kbTopics,
    exm,
    edit,
    getKbCategories,
    getForms,
    kbCategories
  } = props;
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
      return brands.map(f => ({ value: f._id, label: f.name }));
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

  const getFormValues = contentId => {
    if (!contentId) {
      return [];
    }

    if (!forms || forms.length === 0) {
      getForms(contentId);

      return [];
    }

    return forms.map(f => ({ value: f._id, label: f.name }));
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
                placeholder={__(
                  `Choose a ${
                    feature.contentType === 'knowledgeBase'
                      ? 'knowledge base'
                      : 'brand'
                  }`
                )}
                value={feature.contentId}
                options={getContentValues(feature.contentType)}
                onChange={item => {
                  if (feature.contentType === 'knowledgeBase') {
                    getKbCategories(item.value);
                  } else {
                    getForms(item.value);
                  }

                  onChangeFeatureItem(feature._id, 'contentId', item.value);
                }}
                clearable={false}
              />
            </FeatureRowItem>

            {feature.contentType === 'knowledgeBase' ? (
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
            ) : (
              <FeatureRowItem>
                <Select
                  placeholder={__('Choose a form')}
                  value={feature.subContentId}
                  options={getFormValues(feature.contentId)}
                  style={{ width: 200 }}
                  onChange={form =>
                    onChangeFeatureItem(feature._id, 'subContentId', form.value)
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
