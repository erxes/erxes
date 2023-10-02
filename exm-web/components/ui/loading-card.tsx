import { Card, CardContent, CardHeader } from "./card"

const LoadingCard = ({ type }: { type?: string }) => {
  if (type === "chatlist") {
    return (
      <div className="w-full mb-4">
        <Card className="px-6 rounded-none  cursor-pointer flex items-center shadow-none border-none bg-transparent hover:bg-[#F0F0F0]">
          <div className="rounded-full bg-slate-100  w-12 h-12 shrink-0" />

          <div className="w-full px-6">
            <div className="rounded-full bg-slate-100 w-full h-6 mb-2" />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full">
      <Card className="max-w-2xl mx-auto my-4 border-0">
        <CardHeader>
          <div className="rounded-full bg-slate-100  w-10 h-10 mr-4" />
        </CardHeader>
        <CardContent className="px-2 pb-2 items-center ">
          <div className="w-full h-full flex flex-col justify-between">
            <div className="rounded-full bg-slate-100 w-full h-6 mb-2" />
            <div className="rounded-full bg-slate-100 w-4/5 h-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoadingCard
