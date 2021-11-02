import * as React from "react";
import { useState } from "react";
import { IBookingData, IFieldDataWithText } from "../types";
import { readFile, __ } from "../../utils";
import { IProduct } from "../../types";
import Button from "./common/Button";
import { render } from "react-dom";

type Props = {
  product?: IProduct;
  booking: IBookingData;
  goToCategory: (categoryId: string) => void;
  showPopup: () => void;
};

class Product extends React.Component<Props, { selectedImageUrl: string }> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedImageUrl: "",
    };
  }

  render() {
    const { product, booking, goToCategory, showPopup } = this.props;

    if (!product || !booking) {
      return null;
    }
    const { widgetColor } = booking.style;
    const customFieldsDataWithText = product.customFieldsDataWithText || [];

    const showFull = (img: any) => {
      const image = document.getElementById("img-active") as HTMLImageElement;
      if (image) {
        image.src = readFile(img && img.url);
      }
      this.setState({ selectedImageUrl: img.url || "" });
    };

    const renderFieldData = () =>
      customFieldsDataWithText.map((field: IFieldDataWithText, index: any) => (
        <p key={index}>
          <strong>{field.text}:</strong> {field.value}
        </p>
      ));

    const scrollPerClick = 200;
    let scrollAmount = 0;

    const moveCarousel = (orientation: string) => {
      const carousel = document.getElementById("carousel") as HTMLElement;

      if (orientation === "left") {
        carousel.scrollTo({
          top: 0,
          left: scrollAmount -= scrollPerClick,
          behavior: "smooth",
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
            behavior: "smooth",
          });
        } else {
          carousel.scrollTo({
            top: 0,
            left: scrollAmount = -scrollPerClick,
            behavior: "smooth",
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
                        }`,
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
            {renderFieldData()}
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
