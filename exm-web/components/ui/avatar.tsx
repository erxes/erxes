"use client"

import { FC, memo, useState } from "react"
import NextImage, { ImageProps } from "next/image"

import { cn, readFile } from "@/lib/utils"

const Avatar: FC<
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

  const fallbackImage = "/user.png"

  const updatedProps = {
    ...rest,
    src: error ? fallbackImage : readFile(src || "/user.png"),
    alt,
    fill: !width && !height ? true : undefined,
    width,
    height,
  }

  return (
    <NextImage
      {...updatedProps}
      onError={() => setError}
      onLoadingComplete={handleComplete}
      className={cn(className, isImageLoading && "blur-2xl", "text-black")}
      sizes={
        sizes ||
        `(max-width: 768px) 20vw,
  (max-width: 1200px) 15vw,
  15vw`
      }
    />
  )
}

export default memo(Avatar)
