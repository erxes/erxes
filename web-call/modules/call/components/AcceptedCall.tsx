import React, { useEffect, useState } from "react"
import { FiPhoneOff } from "react-icons/fi"

const AcceptedCallComponent = ({
  stopCall,
}: {
  stopCall: (seconds: number) => void
}) => {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = () => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? `0${secs}` : secs}`
  }
  const stop = () => {
    stopCall(seconds)
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Call in Progress</h2>
      <p style={styles.duration}>Duration: {formatTime()}</p>
      <button onClick={() => stop()} style={styles.endCallButton}>
        <FiPhoneOff size={24} color="white" />
      </button>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    textAlign: "center",
  },
  heading: {
    fontSize: "24px",
    color: "#0077ff",
    marginBottom: "10px",
  },
  duration: {
    fontSize: "18px",
    color: "#555",
    marginBottom: "20px",
  },
  endCallButton: {
    backgroundColor: "red",
    border: "none",
    borderRadius: "50%",
    width: "60px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
}

export default AcceptedCallComponent
