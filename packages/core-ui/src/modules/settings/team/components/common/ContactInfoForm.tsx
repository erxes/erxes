import React from "react";
import Uploader from "@erxes/ui/src/components/Uploader";
import { FormControl, FormGroup } from "@erxes/ui/src/components/form";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import { __ } from "modules/common/utils";
import { IAttachment, IFormProps } from "@erxes/ui/src/types";
import { IBranch, ICoordinate, IStructure } from "@erxes/ui/src/team/types";
import { IUserLinks } from "@erxes/ui/src/auth/types";

type Props = {
  object: IStructure | IBranch;
  formProps: IFormProps;
  setLinks: (links: IUserLinks) => void;
  links: IUserLinks;
  setCoordinate: (coordinate: ICoordinate) => void;
  coordinate: ICoordinate;
  setImage: (image: IAttachment | null) => void;
  image: IAttachment | null;
};

export default function ContactInfoForm(props: Props) {
  const {
    object,
    formProps,
    setLinks,
    links,
    setCoordinate,
    coordinate,
    setImage,
    image,
  } = props;

  const onChangeLink = (e) => {
    const { name, value } = e.target;

    setLinks({ ...links, [name]: value });
  };

  const onChangeCoordinate = (e) => {
    const { name, value } = e.target;

    setCoordinate({ ...coordinate, [name]: value });
  };

  const onChangeImage = (images) => {
    if (images && images.length > 0) {
      setImage(images[0]);
    } else {
      setImage(null);
    }
  };

  return (
    <>
      <FormGroup>
        <ControlLabel>{__("Phone number")}</ControlLabel>
        <FormControl
          {...formProps}
          name="phoneNumber"
          defaultValue={object.phoneNumber}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>{__("Email")}</ControlLabel>
        <FormControl {...formProps} name="email" defaultValue={object.email} />
      </FormGroup>
      <FormGroup>
        <ControlLabel>{__("Longitude")}</ControlLabel>
        <FormControl
          name="longitude"
          onChange={onChangeCoordinate}
          defaultValue={coordinate.longitude}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>{__("Latitude")}</ControlLabel>
        <FormControl
          name="latitude"
          onChange={onChangeCoordinate}
          defaultValue={coordinate.latitude}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>{__("Website")}</ControlLabel>
        <FormControl
          name="website"
          placeholder="https://example.com"
          defaultValue={links.website}
          onChange={onChangeLink}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>{__("Facebook")}</ControlLabel>
        <FormControl
          name="facebook"
          placeholder="https://facebook.com"
          defaultValue={links.facebook}
          onChange={onChangeLink}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>{__("whatsapp")}</ControlLabel>
        <FormControl
          name="whatsapp"
          placeholder="https://whatsapp.com"
          defaultValue={links.whatsapp}
          onChange={onChangeLink}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>{__("Twitter")}</ControlLabel>
        <FormControl
          name="twitter"
          defaultValue={links.twitter}
          placeholder="https://twitter.com"
          onChange={onChangeLink}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>{__("Youtube")}</ControlLabel>
        <FormControl
          name="youtube"
          defaultValue={links.youtube}
          placeholder="https://youtube.com"
          onChange={onChangeLink}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>{__("Image")}</ControlLabel>
        <Uploader
          defaultFileList={image ? [image] : []}
          onChange={onChangeImage}
          single={true}
        />
      </FormGroup>
    </>
  );
}
