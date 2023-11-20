// import React, { useState } from "react"

// type Props = {
//   children: any
//   active?: number
//   maxStep?: number
//   direction?: "vertical" | "horizontal"
// }

// const Steps = ({ children, active, maxStep = 6, direction }: Props) => {
//   const [activeStep, setActiveStep] = useState(active ? active : 1)

//   const next = (stepNumber: number) => {
//     if (stepNumber === 0) {
//       if (activeStep <= maxStep) {
//         setActiveStep(activeStep + 1)
//       }
//     } else {
//       setActiveStep(stepNumber)
//     }
//   }

//   const back = (stepNumber: number) => {
//     if (stepNumber !== 0) {
//       if (activeStep <= maxStep) {
//         setActiveStep(activeStep - 1)
//       }
//     } else {
//       setActiveStep(stepNumber)
//     }
//   }

//   const renderContent = () => {
//     let index: number = 0

//     if (direction === "horizontal") {
//       const headerElements: any = []

//       const childrenElements = React.Children.map(children, (child: any) => {
//         if (!child) {
//           return null
//         }
//         const _index = index

//         index++

//         headerElements.push(
//           <ShortStep
//             show={true}
//             active={activeStep >= index}
//             direction={direction}
//             onClick={() => next(_index + 1)}
//           >
//             <div
//               className={`relative z-5 flex justify-center items-center ${
//                 direction === "horizontal"
//                   ? "w-[35px] h-[35px]"
//                   : "w-[25px] h-[25px]"
//               } rounded-full ${
//                 active
//                   ? `${
//                       direction === "horizontal"
//                         ? "bg-[#673FBD]"
//                         : "bg-[#3CCC38]"
//                     }`
//                   : "bg-[#F0F0F0] text-[#393C40]"
//               } mb-[10px]`}
//             >
//               {index}
//             </div>
//             <h5 className="ml-[10px]">{child.props.title || ""}</h5>
//           </ShortStep>
//         )

//         return React.cloneElement(child, {
//           stepNumber: index,
//           active: activeStep,
//           next,
//           back,
//           direction,
//           maxStep,
//         })
//       })

//       return (
//         <div className={`transition-all duration-300 ease-in relative w-full z-2 ${direction && 'shadow-md'} before:relative before:top-7 before:-left-1/2`}>
//           <div className="w-full h-20 px-5 flex justify-center items-center">
//             {headerElements}
//           </div>
//           <div
//             className={`${
//               direction !== "horizontal"
//                 ? "w-[calc(100%-35px)] h-[calc(100%-35px)]"
//                 : "w-full h-[calc(100%-55px)]"
//             } ${`${direction && "ml-auto"}`}`}
//           >
//             {childrenElements}
//           </div>
//         </div>
//       )
//     }

//     return React.Children.map(children, (child: any) => {
//       if (!child) {
//         return null
//       }

//       index++

//       return React.cloneElement(child, {
//         stepNumber: index,
//         active: activeStep,
//         progress: active,
//         next,
//         back,
//         direction,
//         maxStep,
//       })
//     })
//   }

//   return <StepContainer direction={direction}>{renderContent()}</StepContainer>
// }

// export default Steps
