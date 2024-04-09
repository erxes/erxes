import Image from "@/components/ui/image"

function isBrightColor(hexColor: any) {
  hexColor = hexColor.replace(/^#/, "")

  // Convert hexadecimal to RGB values
  const r = parseInt(hexColor.substring(0, 2), 16)
  const g = parseInt(hexColor.substring(2, 4), 16)
  const b = parseInt(hexColor.substring(4, 6), 16)

  // Calculate the perceived brightness using the YIQ formula
  const brightness = (r * 299 + g * 587 + b * 114) / 1000

  // You can adjust this threshold based on your definition of bright or dark
  const brightnessThreshold = 128

  // Return true if the brightness is above the threshold (considered bright)
  return brightness > brightnessThreshold
}

export default function FeedBackground({
  bg,
  description,
}: {
  bg: any
  description?: string
}) {
  let textColor
  const style =
    "h-[450px] w-full flex items-center justify-center mt-[12px] font-bold"

  if (bg.color && bg.color.includes("#")) {
    textColor = isBrightColor(bg.color) ? "text-black" : "text-white"
    return (
      <div className={style} style={{ background: bg.color }}>
        {description && <p className={textColor}>{description}</p>}
      </div>
    )
  }

  textColor = bg.url && bg.url.includes("bg-3") ? "text-black" : "text-white"

  return (
    <div className={`relative ${style}`}>
      {description && (
        <p className={`z-10 relative ${textColor}`}>{description}</p>
      )}
      <Image
        src={bg.url}
        className="w-full h-[450px] absolute top-0 right-0"
        alt="file-type-image"
        width={400}
        height={400}
      />
    </div>
  )
}
