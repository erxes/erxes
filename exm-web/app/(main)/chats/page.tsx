import { FunctionComponent } from "react"

interface ChatsPageProps {}

const ChatsPage: FunctionComponent<ChatsPageProps> = () => {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <p className="text-center text-2xl bold font-bold text-[#65676B]">
        Select a chat or start a new conversation
      </p>
    </div>
  )
}

export default ChatsPage
