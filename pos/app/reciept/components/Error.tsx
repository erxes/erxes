const Error = ({
  message,
}: {
  errorCode?: string
  message?: string
}) => {
  if (!message) return null
  return (
    <div className="py-1">
      {message}
    </div>
  )
}

export default Error
