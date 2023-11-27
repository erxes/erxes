import React from "react"

const EmptyTable = () => {
  const emptyTable = () => {
    return (
      <div className="h-full bg-white flex justify-center items-center overflow-hidden mt-[20px] rounded-lg">
        <div className="flex flex-col justify-center items-center p-10">
          <h1 className="text-[60px] mb-8 text-[#818C8B]">Oh no!</h1>
          <p className="w-[60%] text-center">
            The content you're looking for is not available as there are
            currently no records in this table. You can proceed to make a
            schedule request or check back later for updates.
          </p>
        </div>
        <img src="/images/error.png" />
      </div>
    )
  }

  return <>{emptyTable()}</>
}

export default EmptyTable
