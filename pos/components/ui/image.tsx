"use client"

import { FC, useEffect, useState } from "react"
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
    ...rest
  } = props
  const fixedSrc = readFile(src || "")

  const [isImageLoading, setIsImageLoading] = useState(true)
  const [srcI, setSrcI] = useState(fixedSrc || fallBack || "/product.png")
  const handleComplete = () => setIsImageLoading(false)

  useEffect(() => {
    const fixedSrc = readFile(src || "")
    setSrcI(fixedSrc)
  }, [src])

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
      <Package className={cn("text-zinc-300", className)} strokeWidth={0.5} />
    )

  return (
    <NextImage
      {...updatedProps}
      loader={!srcI.startsWith("/") ? cloudflareLoader : undefined}
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

export function cloudflareLoader({ src, width, quality }: ImageLoaderProps) {
  const params = [`width=${width}`, `quality=${quality || 75}`, "format=auto"]
  return `https://erxes.io/cdn-cgi/image/${params.join(",")}/${src}`
}

//xos.techstore.mn/gateway/read-file?key=0.021508049013006180.51531201349981501.png

export default Image
