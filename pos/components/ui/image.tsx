"use client"

import { FC, useState } from "react"
import NextImage, { ImageLoaderProps, ImageProps } from "next/image"
import { Package } from "lucide-react"

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
    onError = () => setSrcI(props.fallBack || "/product.png"),
    width,
    height,
    fallBack,
    sizes,
    className,
    quality,
    ...rest
  } = props
  const fixedSrc = readFile(src || "")

  const [isImageLoading, setIsImageLoading] = useState(true)
  const [srcI, setSrcI] = useState(fixedSrc || fallBack || "/product.png")
  const handleComplete = () => setIsImageLoading(false)
  const fromCF = srcI.includes("https://imagedelivery.net/")
  const getLoader = () => {
    if (srcI.includes("//:localhost") || srcI.startsWith("/")) {
      return undefined
    }
    return cloudflareLoader
  }

  const updatedProps = {
    ...rest,
    src: srcI,
    alt,
    fill: !width && !height ? true : undefined,
    width,
    height,
    onError,
  }

  if (srcI === "/product.png" || !srcI)
    return (
      <Package
        className={cn(
          "text-zinc-300",
          updatedProps.fill &&
            "h-12 w-12 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute",
          className
        )}
        strokeWidth={0.5}
      />
    )

  return (
    <NextImage
      {...updatedProps}
      src={
        fromCF
          ? cloudflareLoader({
              src: srcI,
              width: parseInt(width?.toString() || "500"),
              quality: parseInt(quality?.toString() || "75"),
            })
          : srcI
      }
      loader={getLoader()}
      onLoad={handleComplete}
      className={cn(className, isImageLoading && "blur-2xl", "text-black")}
      unoptimized={fromCF}
      sizes={
        sizes ||
        `(max-width: 768px) 20vw,
  (max-width: 1200px) 15vw,
  15vw`
      }
    />
  )
}

export function cloudflareLoader({ src, width, quality }: ImageLoaderProps) {
  const params = [`width=${width}`, "format=avif"]
  const trimmedSrc = src.trim()

  if (trimmedSrc.startsWith("https://imagedelivery.net/")) {
    return `${trimmedSrc.slice(0, -6)}${params.join(",")}`
  }

  const q = `quality=${quality || 75}`
  return `https://erxes.io/cdn-cgi/image/${params
    .concat([q])
    .join(",")}/${trimmedSrc}`
}

export default Image
