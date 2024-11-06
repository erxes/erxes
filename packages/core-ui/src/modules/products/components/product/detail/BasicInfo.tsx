import { Actions, InfoWrapper } from "@erxes/ui/src/styles/main";
import { Alert, __, confirm } from "@erxes/ui/src/utils";
import {
  FieldStyle,
  SidebarCounter,
  SidebarFlexRow,
  SidebarList,
} from "@erxes/ui/src/layout/styles";
import { Link, useNavigate } from "react-router-dom";
import { ProductBarcodeContent, ProductContent } from "../../../styles";

import Attachment from "@erxes/ui/src/components/Attachment";
import Button from "@erxes/ui/src/components/Button";
import Dropdown from "@erxes/ui/src/components/Dropdown";
import DropdownToggle from "@erxes/ui/src/components/DropdownToggle";
import { IAttachment } from "@erxes/ui/src/types";
import { IProduct } from "../../../types";
import Icon from "@erxes/ui/src/components/Icon";
import { Name } from "@erxes/ui-contacts/src/customers/styles";
import ProductForm from "@erxes/ui-products/src/containers/ProductForm";
import React from "react";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";
import { Tip } from "@erxes/ui/src";
import { isValidBarcode } from "../../../utils";
import xss from "xss";

type Props = {
  product: IProduct;
  remove: () => void;
};

const BasicInfo: React.FC<Props> = (props) => {
  const navigate = useNavigate();
  const { product, remove } = props;

  const renderVendor = (vendor) => {
    if (!vendor) {
      return (
        <li>
          <FieldStyle>{__(`Vendor`)}</FieldStyle>
          <SidebarCounter>-</SidebarCounter>
        </li>
      );
    }

    return (
      <li>
        <FieldStyle>{__(`Vendor`)}</FieldStyle>
        <SidebarCounter>{vendor.primaryName || ""}</SidebarCounter>
        <Button
          onClick={() => navigate(`/companies/details/${vendor._id}`)}
          btnStyle="link"
          style={{ padding: "0", paddingLeft: "8px" }}
        >
          <Tip text="See Vendor Detail" placement="bottom">
            <Icon icon="rightarrow" />
          </Tip>
        </Button>
      </li>
    );
  };

  const renderBarcodes = (barcodes) => {
    return (
      <>
        <li>
          <FieldStyle>{__(`Barcodes`)}</FieldStyle>
        </li>
        {(barcodes || []).map((item: string, iteration: number) => (
          <ProductBarcodeContent key={iteration} isValid={isValidBarcode(item)}>
            <Link
              to={`/settings/barcode-generator/${product._id}?barcode=${item}`}
            >
              <Icon icon="print" />
              {item}
            </Link>
          </ProductBarcodeContent>
        ))}
      </>
    );
  };

  const renderView = (name, variable) => {
    const defaultName = name.includes("count") ? 0 : "-";

    return (
      <li>
        <FieldStyle>{__(name)}</FieldStyle>
        <SidebarCounter>{variable || defaultName}</SidebarCounter>
      </li>
    );
  };

  const renderAction = () => {
    const onDelete = () =>
      confirm()
        .then(() => remove())
        .catch((error) => {
          Alert.error(error.message);
        });

    const editForm = (props) => <ProductForm {...props} product={product} />;

    const menuItems = [
      {
        title: "Edit basic info",
        trigger: <a href="#edit">{__("Edit")}</a>,
        content: editForm,
        additionalModalProps: { size: "xl" },
      },
    ];

    return (
      <Actions>
        <Dropdown
          as={DropdownToggle}
          toggleComponent={
            <Button btnStyle="simple" size="medium">
              {__("Action")}
              <Icon icon="angle-down" />
            </Button>
          }
          modalMenuItems={menuItems}
        >
          <li>
            <a href="#delete" onClick={onDelete}>
              {__("Delete")}
            </a>
          </li>
        </Dropdown>
      </Actions>
    );
  };

  const renderImage = (item: IAttachment) => {
    if (!item) {
      return null;
    }

    const attachments = [item] as IAttachment[]

    return <Attachment attachment={item} attachments={attachments} />;
  };

  const renderProductContent = () => {
    if (!product.description) {
      return null;
    }

    return (
      <ProductContent
        dangerouslySetInnerHTML={{
          __html: xss(product.description),
        }}
      />
    );
  };

  const renderInfo = () => {
    const {
      code,
      name,
      type,
      category,
      unitPrice,
      barcodes,
      attachment,
      vendor,
    } = product;

    return (
      <Sidebar.Section>
        <InfoWrapper>
          <Name>{name}</Name>
          {renderAction()}
        </InfoWrapper>

        {renderImage(attachment)}
        <SidebarList className="no-link">
          {renderView("Code", code)}
          {renderView("Type", type)}
          {renderView("Category", category ? category.name : "")}
          {renderView("Unit price", (unitPrice || 0).toLocaleString())}
          {renderBarcodes(barcodes)}
          {renderVendor(vendor)}
          <SidebarFlexRow>{__(`Description`)}</SidebarFlexRow>
        </SidebarList>
        {renderProductContent()}
      </Sidebar.Section>
    );
  };

  return renderInfo();
};

export default BasicInfo;
