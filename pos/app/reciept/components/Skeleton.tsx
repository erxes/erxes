import { Skeleton } from "../../../components/ui/skeleton"

const EbarimtSkeleton = () => {
  return (
    <div className="flex-auto space-y-2 p-1">
      <div className="flex items-center justify-center space-x-2 pb-2">
        <Skeleton className="h-8 w-8 " />
        <Skeleton className="h-3 w-1/2" />
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-3 w-10/12" />
      {Array.from({ length: 4 }).map((el, idx) => (
        <div className="flex items-center justify-between" key={idx}>
          <div className="w-5/12">
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-3 w-2/12" />
          <Skeleton className="h-3 w-2/12" />
          <Skeleton className="h-3 w-2/12" />
        </div>
      ))}

      <div className="flex items-center">
        <Skeleton className="h-32 w-1/2" />
        <div className="w-1/2 space-y-3  pl-3">
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-7/12" />
          <Skeleton className="h-3 w-8/12" />
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export default EbarimtSkeleton
