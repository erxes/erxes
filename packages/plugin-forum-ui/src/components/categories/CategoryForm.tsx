import { Divider, StepBody, StepHeader, StepItem } from '../../styles';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { READ_CP_USER_LEVELS, WRITE_CP_USER_LEVELS } from '../../constants';
import React, { useState } from 'react';

import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ICategory } from '../../types';
import Info from '@erxes/ui/src/components/Info';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import TextInfo from '@erxes/ui/src/components/TextInfo';
import { __ } from '@erxes/ui/src/utils';

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
    order?: string;
    description?: string;
    userLevelReqPostRead?: string;
    userLevelReqPostWrite?: string;
    userLevelReqCommentWrite?: string;
  }) => {
    const finalValues = values;

    if (category) {
      finalValues._id = category._id;
    }

    if (finalValues.userLevelReqPostRead === 'GUEST') {
      setPostReadRequiresPermissionGroup(false);
    }

    if (finalValues.userLevelReqCommentWrite === 'GUEST') {
      setCommentWriteRequiresPermissionGroup(false);
    }

    if (finalValues.userLevelReqPostWrite === 'GUEST') {
      setPostWriteRequiresPermissionGroup(false);
    }

    return {
      ...values,
      _id: finalValues._id,
      name: finalValues.name,
      code: finalValues.code || null,
      order: parseInt(finalValues.order || '', 10),
      description: finalValues.description,
      parentId: finalValues.parentId || null,
      thumbnail: finalValues.thumbnail || null,
      userLevelReqPostRead: finalValues.userLevelReqPostRead || 'GUEST',
      userLevelReqPostWrite: finalValues.userLevelReqPostWrite || 'REGISTERED',
      userLevelReqCommentWrite:
        finalValues.userLevelReqCommentWrite || 'REGISTERED',
      postsReqCrmApproval: postsReqCrmApproval || false,
      postReadRequiresPermissionGroup: postReadRequiresPermissionGroup || false,
      postWriteRequiresPermissionGroup:
        postWriteRequiresPermissionGroup || false,
      commentWriteRequiresPermissionGroup:
        commentWriteRequiresPermissionGroup || false
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
          <ControlLabel>Description</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            defaultValue={category.description}
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
          <ControlLabel>Order</ControlLabel>
          <FormControl
            {...formProps}
            name="order"
            type="number"
            defaultValue={category.order}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Parent Category</ControlLabel>
          <FormControl
            {...formProps}
            name="parentId"
            componentClass="select"
            defaultValue={category.parentId || ''}
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

        <h3>User level based permissions</h3>

        <StepItem>
          <StepHeader>{__('Post')}</StepHeader>
          <StepBody>
            <FormGroup>
              <ControlLabel>Read</ControlLabel>
              <FormControl
                {...formProps}
                name="userLevelReqPostRead"
                defaultValue={userLevelReqPostRead}
                componentClass="select"
                onChange={e => setUserLevelReqPostRead(e)}
              >
                {Object.keys(READ_CP_USER_LEVELS).map(enumVal => (
                  <option key={enumVal} value={enumVal}>
                    {enumVal}
                  </option>
                ))}
              </FormControl>
            </FormGroup>
            <FormGroup>
              <ControlLabel>Also requires permission group</ControlLabel>
              <FormControl
                {...formProps}
                name="postReadRequiresPermissionGroup"
                className="toggle-message"
                disabled={userLevelReqPostRead === 'GUEST'}
                componentClass="checkbox"
                checked={postReadRequiresPermissionGroup}
                onChange={() => {
                  setPostReadRequiresPermissionGroup(
                    !postReadRequiresPermissionGroup
                  );
                }}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Write</ControlLabel>
              <FormControl
                {...formProps}
                name="userLevelReqPostWrite"
                defaultValue={userLevelReqPostWrite}
                componentClass="select"
                onChange={e => setUserLevelReqPostWrite(e)}
              >
                {Object.keys(WRITE_CP_USER_LEVELS).map(enumVal => (
                  <option key={enumVal} value={enumVal}>
                    {enumVal}
                  </option>
                ))}
              </FormControl>
            </FormGroup>
            <FormGroup>
              <ControlLabel>Also requires permission group</ControlLabel>
              <FormControl
                {...formProps}
                name="postWriteRequiresPermissionGroup"
                className="toggle-message"
                disabled={userLevelReqPostWrite === 'GUEST'}
                componentClass="checkbox"
                checked={postWriteRequiresPermissionGroup}
                onChange={() => {
                  setPostWriteRequiresPermissionGroup(
                    !postWriteRequiresPermissionGroup
                  );
                }}
              />
            </FormGroup>
          </StepBody>
        </StepItem>

        <StepItem>
          <StepHeader>{__('Comment')}</StepHeader>
          <StepBody>
            <FormGroup>
              <ControlLabel>Read</ControlLabel> Guest
            </FormGroup>
            <FormGroup>
              <ControlLabel>Write</ControlLabel>
              <FormControl
                {...formProps}
                name="userLevelReqCommentWrite"
                defaultValue={userLevelReqCommentWrite}
                componentClass="select"
                onChange={e => setUserLevelReqCommentWrite(e)}
              >
                {Object.keys(WRITE_CP_USER_LEVELS).map(enumVal => (
                  <option key={enumVal} value={enumVal}>
                    {enumVal}
                  </option>
                ))}
              </FormControl>
            </FormGroup>
            <FormGroup>
              <ControlLabel>Also requires permission group</ControlLabel>
              <FormControl
                {...formProps}
                name="commentWriteRequiresPermissionGroup"
                className="toggle-message"
                disabled={userLevelReqCommentWrite === 'GUEST'}
                componentClass="checkbox"
                checked={commentWriteRequiresPermissionGroup}
                onChange={() => {
                  setCommentWriteRequiresPermissionGroup(
                    !commentWriteRequiresPermissionGroup
                  );
                }}
              />
            </FormGroup>
          </StepBody>
        </StepItem>

        <Info>
          <p>
            If "Also requires permission group" is&nbsp;
            <TextInfo textStyle="danger">checked, both 2</TextInfo>&nbsp;
            conditions are required for a user to be able to perform the action.
          </p>
          <p>
            If "Also requires permission group" is&nbsp;
            <TextInfo textStyle="danger">unchecked</TextInfo>, only&nbsp;
            <TextInfo textStyle="danger">one</TextInfo>&nbsp; of 2 conditions is
            required for a user to be able to perform the action.
          </p>
          <Divider />
          <p>
            <b>Conditions:</b>
            <ol>
              <li>User level is high enough</li>
              <li>User is in a permission group that permits the action</li>
            </ol>
          </p>
        </Info>

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
