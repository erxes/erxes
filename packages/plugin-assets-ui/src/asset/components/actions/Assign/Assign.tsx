import Button from '@erxes/ui/src/components/Button';
import { Column, FormWrapper, ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { IAsset } from '../../../../common/types';
import Select from 'react-select-plus';
import Topic from './Topic';
import { Formgroup } from '@erxes/ui/src/components/form/styles';
import { SelectAssignType } from '../../../../style';

export const ASSIGN_TYPE = [
  { label: 'Add', value: 'add' },
  { label: 'Subtract', value: 'subtract' }
];

type Props = {
  objects?: IAsset[];
  kbTopics: any[];
  loadArticles: (categoryId: string) => void;
  loadedArticles: any[];
  save: (doc: { ids: string[]; data: any; callback: () => void }) => void;
  closeModal: () => void;
  selectedArticleIds?: string[];
};

function AssignArticles(props: Props) {
  const { objects, kbTopics, save, closeModal, selectedArticleIds } = props;

  const [assignType, setAssignType] = React.useState<string>('add');
  const [selectedArticles, setSelectedArticles] = React.useState<string[]>(
    selectedArticleIds || []
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    save({
      ids: (objects || []).map(asset => asset._id),
      data: {
        action: assignType,
        articleIds: selectedArticles
      },
      callback: () => {
        setAssignType(assignType);
        setSelectedArticles(selectedArticleIds || []);
        closeModal();
      }
    });
  };

  const renderTopics = () => {
    return kbTopics.map(topic => {
      const updatedProps = {
        ...props,
        topic,
        selectedArticles,
        setSelectedArticles
      };
      return <Topic key={topic._id} {...updatedProps} />;
    });
  };

  const onChangeAction = option => {
    setAssignType(option.value);
  };

  return (
    <form onSubmit={onSubmit}>
      {renderTopics()}

      <FormWrapper>
        <Column>
          {!!objects?.length && !selectedArticleIds?.length && (
            <SelectAssignType>
              <Select
                placeholder={__('Choose status')}
                value={assignType}
                options={ASSIGN_TYPE}
                onChange={onChangeAction}
              />
            </SelectAssignType>
          )}
        </Column>

        <Column>
          <ModalFooter>
            <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
              Cancel
            </Button>

            <Button type="submit" btnStyle="success" icon={'check-circle'}>
              Assign
            </Button>
          </ModalFooter>
        </Column>
      </FormWrapper>
    </form>
  );
}

export default AssignArticles;
