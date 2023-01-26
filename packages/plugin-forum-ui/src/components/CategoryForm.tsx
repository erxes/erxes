import React, { useState } from 'react';
import CategoryParentSelect from '../containers/CategoryParentSelect';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import Button from '@erxes/ui/src/components/Button';

type Props = {
  category?: {
    _id: string;
    name: string;
    code?: string | null;
    parentId?: string | null;
    thumbnail?: string | null;
    postsReqCrmApproval?: boolean | null;
    userLevelReqPostRead?: string | null;
    userLevelReqPostWrite?: string | null;
    userLevelReqCommentWrite?: string | null;
    postReadRequiresPermissionGroup?: boolean | null;
    postWriteRequiresPermissionGroup?: boolean | null;
    commentWriteRequiresPermissionGroup?: boolean | null;
  };
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal?: () => void;
};

const CategoryForm: React.FC<Props> = ({
  category = {} as any,
  renderButton,
  closeModal
}) => {
  const [name, setName] = useState(category?.name || '');
  const [code, setCode] = useState(category?.code || '');
  const [parentId, setParentId] = useState(category?.parentId || '');
  const [thumbnail, setThumbnail] = useState(category?.thumbnail || '');

  const [userLevelReqPostRead, setUserLevelReqPostRead] = useState(
    category?.userLevelReqPostRead || 'GUEST'
  );
  const [userLevelReqPostWrite, setUserLevelReqPostWrite] = useState(
    category?.userLevelReqPostWrite || 'REGISTERED'
  );
  const [userLevelReqCommentWrite, setUserLevelReqCommentWrite] = useState(
    category?.userLevelReqCommentWrite || 'REGISTERED'
  );
  const [postsReqCrmApproval, setPostsReqCrmApproval] = useState(
    category?.postsReqCrmApproval || false
  );

  const [
    postReadRequiresPermissionGroup,
    setPostReadRequiresPermissionGroup
  ] = useState(category?.postReadRequiresPermissionGroup || false);
  const [
    postWriteRequiresPermissionGroup,
    setPostWriteRequiresPermissionGroup
  ] = useState(category?.postWriteRequiresPermissionGroup || false);
  const [
    commentWriteRequiresPermissionGroup,
    setCommentWriteRequiresPermissionGroup
  ] = useState(category?.commentWriteRequiresPermissionGroup || false);

  const generateDoc = (values: {
    _id?: string;
    name: string;
    code?: string;
    parentId?: string;
    thumbnail?: string;
    // userLevelReqPostRead?: string;
    // userLevelReqPostWrite?: string;
    // userLevelReqCommentWrite?: string;
    postsReqCrmApproval?: boolean;
    // postReadRequiresPermissionGroup?: boolean;
    // postWriteRequiresPermissionGroup?: boolean;
    // commentWriteRequiresPermissionGroup?: boolean;
  }) => {
    const finalValues = values;

    if (category) {
      finalValues._id = category._id;
    }

    return {
      ...values,
      _id: finalValues._id,
      name: finalValues.name,
      code: finalValues.code || null,
      parentId: parentId || null,
      thumbnail: finalValues.thumbnail || null,
      userLevelReqPostRead: 'GUEST',
      userLevelReqPostWrite: 'REGISTERED',
      userLevelReqCommentWrite: 'REGISTERED',
      postsReqCrmApproval: postsReqCrmApproval || false,
      postReadRequiresPermissionGroup: false,
      postWriteRequiresPermissionGroup: false,
      commentWriteRequiresPermissionGroup: false
    };
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            defaultValue={category.name}
            required={true}
            autoFocus={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Code</ControlLabel>
          <FormControl
            {...formProps}
            name="code"
            defaultValue={category.code}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Parent Category</ControlLabel>
          <CategoryParentSelect
            value={parentId}
            parentFor={Object.keys(category).length !== 0 ? category._id : null}
            onChange={setParentId}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Thumbnail url</ControlLabel>
          <FormControl
            {...formProps}
            name="thumbnail"
            defaultValue={category.thumbnail}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>
            Posts in this category require admin approval
          </ControlLabel>
          <FormControl
            {...formProps}
            name="postsReqCrmApproval"
            className="toggle-message"
            componentClass="checkbox"
            checked={postsReqCrmApproval}
            onChange={() => {
              setPostsReqCrmApproval(!postsReqCrmApproval);
            }}
          />
        </FormGroup>

        <ModalFooter id={'AddTagButtons'}>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Cancel
          </Button>

          {renderButton({
            name: 'category',
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: category
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default CategoryForm;
