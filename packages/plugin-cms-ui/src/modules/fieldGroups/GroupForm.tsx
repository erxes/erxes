import { IFormProps } from '@erxes/ui/src/types';
import React from 'react';

import { useMutation, gql, useQuery } from '@apollo/client';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils/core';
import { mutations } from './graphql';
import queries from '../customPostTypes/graphql/queries';
import Select from 'react-select';
import SelectPage from '../pages/components/SelectPage';
import SelectCategory from '../categories/containers/SelectCategory';

type Props = {
  clientPortalId: string;
  group?: any;
  groups: any[];

  closeModal: () => void;
  refetch?: () => void;
};

const GroupForm = (props: Props) => {
  const [doc, setDoc] = React.useState<any>(props.group || {});
  const { data, loading: typesLoading } = useQuery(queries.CUSTOM_TYPES, {
    variables: {
      clientPortalId: props.clientPortalId,
    },
  });

  const [add] = useMutation(mutations.ADD);
  const [edit] = useMutation(mutations.EDIT);

  const submit = () => {
    const keysToDelete = [
      '_id',
      '__typename',
      'createdAt',
      'fields',
      'customPostTypes',
    ];

    const input: any = {
      clientPortalId: props.clientPortalId,
    };

    Object.keys(doc).forEach((key) => {
      if (keysToDelete.indexOf(key) === -1) {
        input[key] = doc[key];
      }
    });

    if (props.group) {
      edit({
        variables: {
          id: props.group._id,
          input,
        },
      }).then(() => {
        props.closeModal();
        if (props.refetch) {
          props.refetch();
        }
      });
    } else {
      add({
        variables: {
          input,
        },
      }).then(() => {
        props.closeModal();
        if (props.refetch) {
          props.refetch();
        }
      });
    }
  };

  const typeOptions = React.useMemo(() => {
    return (data?.cmsCustomPostTypes || []).map((type: any) => ({
      value: type._id,
      label: type.label,
    }));
  }, [data]);

  const renderPages = () => {
    if (!doc?.customPostTypeIds?.includes('page')) {
      return null;
    }

    return (
      <FormGroup>
        <ControlLabel>{__('Pages')}</ControlLabel>
        <p>{__('Select the pages where you want to enable this group')}</p>
        <SelectPage
          isMulti={true}
          value={doc.enabledPageIds}
          clientPortalId={props.clientPortalId}
          onChange={(pageIds) => {
            setDoc({
              ...doc,
              enabledPageIds: pageIds,
            });
          }}
        />
      </FormGroup>
    );
  };

  const renderCategories = () => {
    if (!doc?.customPostTypeIds?.includes('category')) {
      return null;
    }

    return (
      <FormGroup>
        <ControlLabel>{__('Categories')}</ControlLabel>
        <p>{__('Select the categories where you want to enable this group')}</p>
        <SelectCategory
          clientPortalId={props.clientPortalId}
          isMulti={true}
          value={doc.enabledCategoryIds}
          onChange={(categoryIds) => {
            setDoc({
              ...doc,
              enabledCategoryIds: categoryIds,
            });
          }}
        />
      </FormGroup>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    return (
      <>
        <FormGroup>
          <ControlLabel>{__('Label')}</ControlLabel>
          <FormControl
            {...formProps}
            id={'label'}
            name={'label'}
            type={'text'}
            required={true}
            defaultValue={doc.label}
            onChange={(e: any) => setDoc({ ...doc, label: e.target.value })}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Key')}</ControlLabel>
          <FormControl
            {...formProps}
            id={'code'}
            name={'code'}
            type={'text'}
            required={true}
            defaultValue={doc.code}
            onChange={(e: any) => setDoc({ ...doc, code: e.target.value })}
          />
        </FormGroup>

        {props.groups.length > 0 && (
          <FormGroup>
            <ControlLabel>{__('Parent')}</ControlLabel>
            <FormControl
              {...formProps}
              name='parentId'
              componentclass='select'
              defaultValue={doc.parentId || null}
              onChange={(e: any) => {
                setDoc({ ...doc, parentId: e.target.value });
              }}
            >
              <option value='' />
              {props.groups
                .filter((g) => g._id !== doc._id)
                .map((g) => {
                  return (
                    <option key={g._id} value={g._id}>
                      {g.label}
                    </option>
                  );
                })}
            </FormControl>
          </FormGroup>
        )}

        {typesLoading ? (
          <p>Loading...</p>
        ) : (
          <FormGroup>
            <ControlLabel>{__('Types')}</ControlLabel>
            <p>{__('Select allowed types for this group')}</p>
            <Select
              placeholder={__('Select type')}
              isMulti={true}
              options={typeOptions}
              value={
                typeOptions.filter((o) =>
                  doc.customPostTypeIds?.includes(o.value)
                ) || []
              }
              onChange={(options) => {
                setDoc({
                  ...doc,
                  customPostTypeIds: options.map((o) => o.value),
                });
              }}
            />
          </FormGroup>
        )}

        {renderPages()}

        {renderCategories()}
        <ModalFooter>
          <Button
            btnStyle='simple'
            onClick={props.closeModal}
            icon='times-circle'
          >
            Close
          </Button>

          <Button
            btnStyle='success'
            icon='save'
            onClick={() => {
              submit();
            }}
          >
            Save
          </Button>
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default GroupForm;
