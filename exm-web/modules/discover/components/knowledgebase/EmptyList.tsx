import React from "react"

type Props = {
  title?: string
  description?: string
}

const EmptyList = ({ title, description }: Props) => {
  const emptyList = () => {
    return (
      <div className="h-full bg-white justify-center items-center overflow-hidden mt-[20px] rounded-lg md:flex md:flex-col lg:flex-row">
        <div className="flex flex-col justify-center items-center p-10">
          <h1 className="text-[60px] whitespace-nowrap mb-8 text-[#818C8B]">
            {title || "Oh no!"}
          </h1>
          <p className="w-[50%] text-center">
            {description ||
              "The content you're looking for is not available as there are currently no items in this list. You can check back later for updates."}
          </p>
        </div>
        <img src="/images/error.png" />
      </div>
    )
  }

  {
    return <>{emptyList()}</>
  }
}

export default EmptyList
