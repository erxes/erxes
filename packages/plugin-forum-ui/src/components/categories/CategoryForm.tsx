import React, { useState } from 'react';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import Button from '@erxes/ui/src/components/Button';
import { ICategory } from '../../types';

type Props = {
  category?: ICategory;
  categories?: ICategory[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal?: () => void;
};

const CategoryForm: React.FC<Props> = ({
  category = {} as any,
  renderButton,
  closeModal,
  categories
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
      parentId: finalValues.parentId || null,
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
          <FormControl
            {...formProps}
            name="parentId"
            componentClass="select"
            defaultValue={parentId}
          >
            <option key="null" value="">
              No parent (root category)
            </option>
            {categories &&
              categories.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
          </FormControl>
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
