import { CheckCircle2 } from "lucide-react"

import { Button } from "./button"

const SuccessPost = ({ text }: { text?: string }) => {
  return (
    <>
      <div className="backdrop-blur-sm z-10 flex flex-col items-center justify-center absolute w-full h-full">
        <CheckCircle2 color="green" size={50} className="mb-5" />
        <h3 className="text-md font-semibold text-[#444]">
          {(text && text) || "Success !"}
        </h3>
      </div>
    </>
  )
}

export default SuccessPost
