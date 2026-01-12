/* eslint-disable @next/next/no-img-element */
import { useState } from "react"
import { ImagePlusIcon, XIcon } from "lucide-react"

import uploadHandler, { deleteHandler } from "@/lib/uploadHandler"
import { getEnv, READ_FILE } from "@/lib/utils"

import { Button } from "./button"
import Image from "./image"
import { Input } from "./input"
import Loader from "./loader"
import { toast } from "./use-toast"

const Uploader = ({
  id,
  attachment,
  setAttachment,
}: {
  id?: string
  attachment?: { url?: string } | null
  setAttachment: (attachment?: { url?: string } | null) => void
}) => {
  const [loading, setLoading] = useState(false)

  const handleFileInput = (e: any) => {
    uploadHandler({
      files: e.target.files,

      beforeUpload: () => {
        setLoading(true)
        !!attachment && setAttachment(attachment)
      },

      afterUpload: ({ status, response, fileInfo }) => {
        if (status !== "ok") {
          toast({ description: response.statusText })
          setLoading(false)
        } else {
          toast({ description: "Амжилттай" })
          setLoading(false)
          setAttachment({ url: response })
        }
      },
      afterRead: ({ result, fileInfo }) => {
        setAttachment({ url: result })
      },
    })
  }

  return (
    <div className="relative h-24 border rounded-md overflow-hidden">
      {loading ? (
        <Loader className="absolute inset-0 opacity-50" />
      ) : (
        <ImagePlusIcon
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 opacity-30 text-slate-500"
          strokeWidth={1.2}
        />
      )}

      <Input
        className="absolute inset-0 opacity-0 h-auto disabled:opacity-0"
        type="file"
        disabled={loading}
        onChange={handleFileInput}
        id={id}
      />
      {!!attachment && (
        <div className="absolute inset-0 flex items-center justify-center group">
          <div className="relative">
            <Image
              src={
                getEnv().NEXT_PUBLIC_MAIN_API_DOMAIN +
                READ_FILE +
                attachment?.url
              }
              alt=""
              height={94}
              width={94}
            />

            <Button
              className="bg-destructive p-0 hover:bg-destructive rounded-full absolute top-0 -right-3 hidden group-hover:inline-flex h-6 w-6"
              onClick={() => {
                if (attachment?.url) {
                  deleteHandler({
                    fileName: attachment.url,
                    afterUpload({ status }) {
                      toast({ description: status })
                    },
                  })
                  setAttachment(null)
                }
              }}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Uploader
