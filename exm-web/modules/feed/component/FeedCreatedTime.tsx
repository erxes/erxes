import dayjs from "dayjs"

export default function CreatedDate({ createdAt }: { createdAt?: Date }) {
  if (createdAt) {
    const postCreationDate: any = new Date(createdAt)
    const currentDate: any = new Date()
    const differenceInMilliseconds = currentDate - postCreationDate
    const monthsDifference =
      differenceInMilliseconds / (1000 * 60 * 60 * 24 * 30.44)

    if (monthsDifference >= 2) {
      return <>{dayjs(createdAt).format("MM/DD/YYYY h:mm A")}</>
    }

    return <>{dayjs(createdAt).fromNow()}</>
  }

  return null
}
