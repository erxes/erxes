import Image from "./ui/image"

export const ImageGrid = ({
  attachments,
  onClickHandler,
}: {
  attachments: any[]
  onClickHandler?: (index: number) => void
}) => {
  return (
    <div className="w-full h-[530px] flex flex-wrap overflow-hidden relative gap-[4px]">
      {attachments.map((image, index) => {
        const length = attachments.length
        let width
        if (length === 1 || length === 2) {
          width = "w-full"
        }
        if (length === 3) {
          if (index === 2) {
            width = "w-full"
          } else {
            width = "flex-1 w-1/2"
          }
        }
        if (length === 4 || length > 4) {
          width = "w-[calc(50%-2px)]"
        }

        if (index > 4) {
          return null
        }

        return (
          <Image
            key={index}
            alt={`image ${index}`}
            src={image.url || ""}
            width={500}
            height={500}
            className={`overflow-hidden object-cover cursor-pointer ${width} ${
              length !== 1 ? "h-[263px]" : "h-full"
            }`}
            onClick={() => onClickHandler && onClickHandler(index)}
          />
        )
      })}
      {attachments.length > 4 && (
        <div
          className="text-white bg-black/50 w-[calc(50%-2px)] h-[263px] absolute bottom-0 right-0 flex items-center justify-center text-[30px] cursor-pointer"
          onClick={() => onClickHandler && onClickHandler(3)}
        >
          + {attachments.length - 4}
        </div>
      )}
    </div>
  )
}
