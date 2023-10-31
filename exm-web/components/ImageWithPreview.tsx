"use client"

import Slider from "react-slick"

import { cn } from "@/lib/utils"
import Image from "@/components/ui/image"

export const ImageWithPreview = ({
  images,
  className,
  deleteImage,
}: {
  images: any[]
  className?: string
  deleteImage?: (index: number) => void
}) => {
  const renderAttachmentPreview = () => {
    if (images && images.length === 0) {
      return null
    }

    return (
      <div id="gallery" className={cn("relative w-full", className)}>
        <Slider
          className={"slider-activity"}
          centerPadding={"60px"}
          slidesToShow={1}
          arrows={true}
          dots={true}
          responsive={[
            {
              breakpoint: 1024,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
              },
            },
            {
              breakpoint: 600,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                initialSlide: 1,
              },
            },
            {
              breakpoint: 480,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
              },
            },
          ]}
        >
          {images.map((image: any, i: number) => (
            <Image
              key={i}
              alt="image"
              src={image?.url || ""}
              width={1000}
              height={1000}
              className="w-full h-full object-contain cursor-pointer max-h-[800px]"
            />
          ))}
        </Slider>
      </div>
    )
  }

  return <>{renderAttachmentPreview()}</>
}
