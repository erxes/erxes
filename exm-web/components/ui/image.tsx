"use client"

import { FC, memo, useState } from "react"
import NextImage, { ImageProps } from "next/image"

import { cn, readFile } from "@/lib/utils"

const Image: FC<
  ImageProps & {
    src?: string
    alt?: string
    fallBack?: string
  }
> = (props) => {
  const {
    src,
    fill = true,
    alt = "",

    width,
    height,
    fallBack,
    sizes,
    className,
    ...rest
  } = props

  const [isImageLoading, setIsImageLoading] = useState(true)
  const handleComplete = () => setIsImageLoading(false)

  const [error, setError] = useState(null)

  const fallbackImage = "/avatar-colored.svg"

  const updatedProps = {
    ...rest,
    src: error
      ? fallbackImage
      : readFile(src, width as number) || "/avatar-colored.svg",
    alt,
    fill: !width && !height ? true : undefined,
    width,
    height,
  }

  return (
    <NextImage
      {...updatedProps}
      quality={100}
      onError={() => setError}
      onLoadingComplete={handleComplete}
      className={cn(className, isImageLoading && "blur-10xl", "text-black")}
    />
  )
}

export default memo(Image)
