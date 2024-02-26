import { useEffect, useState } from "react"
import { IAttachment } from "@/modules/types"

import Image from "@/components/ui/image"
import Loader from "@/components/ui/loader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import DragNDrop from "@/components/DragNDrop"

import FormAttachments from "./FormAttachments"
import FormImages from "./FormImages"
import { BGS, COLORS } from "./constants"

export default function AttachmentBgSection({
  uploading,
  images,
  setImage,
  attachments,
  setAttachments,
  setUploading,
  setBackground,
  background,
}: {
  uploading: boolean
  images: IAttachment[]
  attachments: IAttachment[]
  setImage: (images: any[]) => void
  setAttachments: (attachments: any[]) => void
  setBackground: (background: any) => void
  setUploading: (status: boolean) => void
  background: IAttachment
}) {
  const [bg, setBg] = useState(background || { type: "bg", item: "blank" })
  const [customColor, setCustomColor] = useState("")
  const disabled = images.length > 0 || attachments.length > 0
  const style =
    "text-[#A1A1A1] data-[state=active]:text-primary data-[state=active]:border-[#5629B6] data-[state=active]:border-b-2 h-[45px] hover:font-medium hover:text-[#A1A1A1"
  const activeStyle = "border-[1.5px] !border-primary"

  useEffect(() => {
    if (bg.color === "") {
      setBackground(null)
    }

    setBackground(
      customColor
        ? {
            type: "color",
            color: `#${customColor}`,
            url: "noUrl",
            name: "custom color",
          }
        : bg
    )
  }, [bg, customColor])

  const onClickHandler = (type: string, item: string) => {
    setBg({ type, color: item, url: item, name: "feed background" })
    setCustomColor("")
  }

  const handleColor = (event: any) => {
    setCustomColor(event.target.value)
  }

  const renderTooltip = (text: string) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="cursor-not-allowed">{text}</TooltipTrigger>
          <TooltipContent>
            This can't be combined with what you've already added to your post
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Tabs defaultValue="attachment" className="h-full w-full">
      <TabsList className="border-b border-[#eee] ">
        <div className="flex justify-between">
          <div className="items-center flex justify-evenly w-full">
            <TabsTrigger className={style} value="attachment">
              {bg ? renderTooltip("Attachment") : "Attachment"}
            </TabsTrigger>
            <TabsTrigger className={style} value="bg" disabled={disabled}>
              {disabled ? renderTooltip("Background") : "Background"}
            </TabsTrigger>
            <TabsTrigger className={style} value="color">
              {disabled ? renderTooltip("Color") : "Color"}
            </TabsTrigger>
          </div>
        </div>
      </TabsList>

      <TabsContent value={"attachment"} className="h-[calc(100%-45px)]">
        <div className="overflow-auto h-[60%] px-4 pt-4">
          {uploading && <Loader className="pb-4" />}
          <FormImages images={images} setImage={setImage} />
          <FormAttachments
            attachments={attachments || []}
            setAttachments={setAttachments}
            type="form"
          />
        </div>

        <div className="flex h-[40%] border-t border-exm p-4">
          <DragNDrop
            setAttachments={setAttachments}
            setImage={setImage}
            className="w-full h-full"
            setUploading={setUploading}
            defaultFileList={images.concat(attachments)}
          />
        </div>
      </TabsContent>
      <TabsContent
        value={"bg"}
        className="h-[calc(100%-45px)] w-full px-4 py-3"
      >
        <p className="mb-3 text-[#98A2B3]">All backgrounds</p>
        <div className="w-full grid grid-cols-3 gap-3">
          <div
            className={`rounded-sm border border-exm flex justify-center items-center text-[#667085] text-[20px] font-bold cursor-pointer ${
              bg.url === "" || (bg.url || "").includes("#") ? activeStyle : ""
            } `}
            onClick={() => onClickHandler("bg", "")}
          >
            BLANK
          </div>
          {BGS.map((url: string) => (
            <Image
              alt=""
              src={url}
              height={60}
              width={100}
              loading="lazy"
              className={`w-full h-[55px] object-cover rounded-sm cursor-pointer ${
                bg.url === url ? activeStyle : ""
              } `}
              onClick={() => onClickHandler("bg", url)}
            />
          ))}
        </div>
      </TabsContent>
      <TabsContent
        value={"color"}
        className="h-[calc(100%-45px)] w-full px-4 py-3"
      >
        <p className="mb-3 text-[#98A2B3]">Choose background color</p>
        <div className="w-full flex flex-wrap gap-3 mb-3">
          {COLORS.map((color: string) => (
            <div
              className={`h-[30px] w-[30px] cursor-pointer rounded-sm ${
                bg.color === color && customColor === "" ? activeStyle : ""
              }`}
              style={{ background: color }}
              onClick={() => onClickHandler("color", color)}
            />
          ))}
        </div>
        <div className="h-[30px] flex text-sm border border-exm">
          <p className="text-[#98a1a4] bg-[#f0f0f0] h-full w-[30px] rounded-sm rounded-tr-none rounded-br-none flex justify-center items-center">
            #
          </p>
          <input
            className="pl-2 flex-1"
            placeholder="Write hex color code"
            onChange={handleColor}
            value={customColor}
          />
        </div>
      </TabsContent>
    </Tabs>
  )
}
