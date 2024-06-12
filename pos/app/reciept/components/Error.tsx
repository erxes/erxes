const Error = ({
  errorCode,
  message,
}: {
  errorCode?: string
  message?: string
}) => {
  if (!errorCode || !message) {
    return null
  }
  return (
    <div className="py-1">
      {message}
    </div>
  )
}

export default Error
