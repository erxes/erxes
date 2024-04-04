import React, { useState } from 'react';
// erxes

// local
import ModalTrigger from '../../../common/ModalTrigger';
import Icon from '../../../common/Icon';
import { ParticipantItemWrapper } from '../../styles';
import FormGroup from '../../../common/form/Group';
import FormControl from '../../../common/form/Control';
import Button from '../../../common/Button';
import Uploader from '../../../common/Uploader';

type Props = {
  chat?: any;
  editChat: (_id: string, name?: any[], featuredImage?: string) => void;
};

const GroupChat = (props: Props) => {
  const { chat, editChat } = props;

  const [name, setName] = useState(chat.name || '');
  const [featuredImage, setFeaturedImage] = useState(chat.featuredImage || []);

  const handleSubmit = (callback) => {
    editChat(chat._id, name, featuredImage);
    callback();
  };

  const changeName = (p) => {
    return (
      <>
        <h3>Change Name</h3>
        <FormGroup>
          <FormControl
            placeholder="Title"
            type="text"
            name="name"
            onChange={(e: any) => setName(e.target.value)}
            defaultValue={name}
          />
        </FormGroup>
        <br />
        <Button
          style={{ float: 'right' }}
          onClick={() => handleSubmit(p.closeModal)}
        >
          Add
        </Button>
        <Button
          btnStyle="simple"
          style={{ float: 'right', marginRight: '10px' }}
          onClick={p.closeModal}
        >
          Cancel
        </Button>
      </>
    );
  };

  const changeImage = (p) => {
    return (
      <>
        <h3>Change Name</h3>
        <Uploader
          defaultFileList={featuredImage}
          onChange={setFeaturedImage}
          btnText="Cover Image"
          btnIcon="image"
          single={true}
          btnIconSize={30}
        />
        <br />
        <Button
          style={{ float: 'right' }}
          onClick={() => handleSubmit(p.closeModal)}
        >
          Add
        </Button>
        <Button
          btnStyle="simple"
          style={{ float: 'right', marginRight: '10px' }}
          onClick={p.closeModal}
        >
          Cancel
        </Button>
      </>
    );
  };

  return (
    <>
      <ModalTrigger
        title="Add people"
        trigger={
          <ParticipantItemWrapper>
            <a href="#">
              <Icon
                icon="edit"
                size={13}
                color="black"
                style={{ margin: '0 0.6em' }}
              />
              Change group chat name
            </a>
          </ParticipantItemWrapper>
        }
        content={(p) => changeName(p)}
        isAnimate={true}
        hideHeader={true}
      />

      <ModalTrigger
        title="Add people"
        trigger={
          <ParticipantItemWrapper>
            <a href="#">
              <Icon
                icon="edit"
                size={13}
                color="black"
                style={{ margin: '0 0.6em' }}
              />
              Change group chat image
            </a>
          </ParticipantItemWrapper>
        }
        content={(p) => changeImage(p)}
        isAnimate={true}
        hideHeader={true}
      />
    </>
  );
};

export default GroupChat;
