import * as React from "react";
import { IBookingData } from "../types";
import { readFile, __ } from "../../utils";
import { IProduct } from "../../types";
import Button from "./common/Button";
import { IField } from "../../form/types";

type Props = {
  product?: IProduct;
  booking: IBookingData;
  goToCategory: (categoryId: string) => void;
  showPopup: () => void;
  fields?: IField[];
};

class Product extends React.Component<Props, { selectedImageUrl: string }> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedImageUrl: ""
    };
  }

  render() {
    const { product, booking, goToCategory, showPopup, fields } = this.props;

    if (!product || !booking || !fields) {
      return null;
    }

    const { productFieldIds } = booking;
    const { widgetColor } = booking.style;

    const customFieldsData = product.customFieldsData || [];

    const showFull = (img: any) => {
      const image = document.getElementById("img-active") as HTMLImageElement;
      if (image) {
        image.src = readFile(img && img.url);
      }
      this.setState({ selectedImageUrl: img.url || "" });
    };

    const data: any = {};

    for (const customFieldData of customFieldsData || []) {
      data[customFieldData.field] = customFieldData.value;
    }

    const renderFieldsData = () =>
      fields.map((field: IField, index: any) => {
        if (field.isDefinedByErxes) {
          if (productFieldIds.indexOf(field._id) !== -1) {
            data[field._id] = product[field.type as keyof IProduct];
          }
        }

        if (
          !data[field._id] ||
          productFieldIds.indexOf(field._id) === -1 ||
          field.text === "Description"
        ) {
          return null;
        }

        return (
          <p key={index}>
            <strong>{field.text}: </strong>
            {data[field._id] || ""}
          </p>
        );
      });

    const scrollPerClick = 200;
    let scrollAmount = 0;

    const moveCarousel = (orientation: string) => {
      const carousel = document.getElementById("carousel") as HTMLElement;

      if (orientation === "left") {
        carousel.scrollTo({
          top: 0,
          left: scrollAmount -= scrollPerClick,
          behavior: "smooth"
        });

        if (scrollAmount < 0) {
          scrollAmount = 0;
        }
      }

      if (orientation === "right") {
        if (scrollAmount <= carousel.scrollWidth - carousel.clientWidth) {
          carousel.scrollTo({
            top: 0,
            left: scrollAmount += scrollPerClick,
            behavior: "smooth"
          });
        } else {
          carousel.scrollTo({
            top: 0,
            left: scrollAmount = -scrollPerClick,
            behavior: "smooth"
          });
        }
      }
    };

    const allAttachments = product.attachmentMore || [];

    const renderBtn = (type: string) => {
      return (
        <div className={`slider-btn-container flex-items-center ${type}`}>
          {allAttachments && allAttachments.length > 0 ? (
            <div
              onClick={() => moveCarousel(type)}
              className={`btn-move btn-move-${type}`}
            />
          ) : (
            ""
          )}
        </div>
      );
    };

    return (
      <>
        <div className="flex-sa">
          <div className="slider">
            <div className="sliderWrapper">
              <div className="active flex-center">
                <img
                  id="img-active"
                  src={readFile(product.attachment && product.attachment.url)}
                  alt={product.attachment && product.attachment.name}
                />
              </div>
              <div className="relative">
                {renderBtn("left")}
                <div id="carousel">
                  {(allAttachments || []).map((img, index) => (
                    <div
                      className={`slider-item flex-center`}
                      key={index}
                      onClick={() => showFull(img)}
                      style={{
                        border: `2px solid ${
                          this.state.selectedImageUrl === img.url
                            ? widgetColor
                            : "transparent"
                        }`
                      }}
                    >
                      <img
                        id={img && img.name}
                        src={readFile(img && img.url)}
                        alt={img && img.name}
                      />
                    </div>
                  ))}
                </div>
                {renderBtn("right")}
              </div>
            </div>
          </div>
          <div className="w-40">
            <div className="title text-center">
              <h4>{product.name}</h4>
              <p className="text-center">
                <div
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </p>
            </div>
            {renderFieldsData()}
          </div>
        </div>

        <div className="footer">
          <Button
            text={__("Back")}
            type="back"
            onClickHandler={() => goToCategory(product.categoryId)}
            style={{ backgroundColor: widgetColor, left: 0 }}
          />
          <Button
            text={booking.bookingFormText}
            type=""
            onClickHandler={() => showPopup()}
            style={{ backgroundColor: widgetColor, right: 0 }}
          />
        </div>
      </>
    );
  }
}

export default Product;
