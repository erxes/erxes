import React from "react"

import RingingCallComponent from "../components/RingingCall"

type IProps = {
  stopCall: ({ seconds }: { seconds: number }) => void
}
const RingingCallContainer = (props: IProps) => {
  return <RingingCallComponent {...props} />
}

export default RingingCallContainer
