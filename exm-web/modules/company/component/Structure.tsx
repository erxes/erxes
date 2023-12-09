import React, { useCallback, useEffect, useRef, useState } from "react"
import { ChevronsLeft } from "lucide-react"
import RTG from "react-transition-group"
import ReactFlow, {
  Background,
  Position,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useStoreApi,
} from "reactflow"

import Image from "@/components/ui/image"

import "reactflow/dist/style.css"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import SelectUser from "@/components/select/SelectUser"

import { useUserDetail } from "../../team-member/hooks/useUserDetail"

const initialNodes = [
  {
    id: "0",
    type: "input",
    data: {
      label: (
        <div className="w-full text-left">
          <div className="text-[10px] mb-2">Position</div>
          <div className="flex items-center gap-1">
            <Image
              alt="profile picture"
              height={100}
              width={200}
              className="w-[28px] h-[28px] object-cover rounded-full border border-primary shrink-0"
              src="/avatar-colored.svg"
            />
            <p className="font-normal">Name</p>
          </div>
        </div>
      ),
    },
    position: { x: 500, y: 0 },
  },
]

let id = 1
const getId = () => `${id++}`
const MIN_DISTANCE = 200

interface ICustomNode extends Node {
  sourcePosition: Position
  targetPosition: Position
  id: string
}

const Structure = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const connectingNodeId = useRef(null)
  const [showBuilder, setShowBuilder] = useState(false)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const { screenToFlowPosition } = useReactFlow()
  const [userId, setUserId] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedNode, setSelectedNode] = useState<ICustomNode | null>(null)
  const { userDetail } = useUserDetail({ userId })
  const store = useStoreApi()

  useEffect(() => {
    const handleOutSideClick = (event: MouseEvent) => {
      if (reactFlowWrapper.current && showBuilder) {
        if (
          !reactFlowWrapper.current.contains(event.target as Node) &&
          event.target instanceof HTMLElement
        ) {
          setShowBuilder(false)
        }
      }
    }

    window.addEventListener("click", handleOutSideClick)

    return () => {
      window.removeEventListener("click", handleOutSideClick)
    }
  }, [showBuilder])

  useEffect(() => {
    setDialogOpen(false)
  }, [userId])

  useEffect(() => {
    if (selectedNode && userId !== "") {
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === selectedNode.id
            ? {
                ...node,
                data: {
                  ...node.data,
                  label: (
                    <div className="w-full text-left">
                      <div className="text-[10px] mb-2">
                        {userDetail?.details?.position}
                      </div>
                      <div className="flex items-center gap-1">
                        <Image
                          alt="profile picture"
                          height={100}
                          width={200}
                          className="w-[28px] h-[28px] object-cover rounded-full border border-primary shrink-0"
                          src={
                            userDetail?.details?.avatar || "/avatar-colored.svg"
                          }
                        />
                        <p className="font-normal">
                          {userDetail?.details?.fullName}
                        </p>
                      </div>
                    </div>
                  ),
                },
              }
            : node
        )
      )
    }
  }, [userId, userDetail])

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const getClosestEdge = useCallback((node: any) => {
    const { nodeInternals } = store.getState()
    const storeNodes = Array.from(nodeInternals.values())

    const closestNode = storeNodes.reduce(
      (res, n) => {
        if (n.id !== node.id) {
          const dx = (n?.positionAbsolute?.x || 0) - node.positionAbsolute.x
          const dy = (n?.positionAbsolute?.y || 0) - node.positionAbsolute.y
          const d = Math.sqrt(dx * dx + dy * dy)

          if (d < MIN_DISTANCE) {
            res.distance = d
            res.node = n
          }
        }

        return res
      },
      {
        distance: Number.MAX_VALUE,
        node: null,
      }
    )

    if (!closestNode.node) {
      return null
    }

    return {
      id: `${closestNode.node.id}-${node.id}`,
      source: closestNode.node.id,
      target: node.id,
      className: "",
    }
  }, [])

  const onNodeDrag = useCallback(
    (_: any, node: any) => {
      const closeEdge = getClosestEdge(node)

      setEdges((es) => {
        const nextEdges = es.filter((e) => e.className !== "temp")

        if (
          closeEdge &&
          !nextEdges.find(
            (ne) =>
              ne.source === closeEdge.source && ne.target === closeEdge.target
          )
        ) {
          closeEdge.className = "temp"
          nextEdges.push(closeEdge)
        }

        return nextEdges
      })
    },
    [getClosestEdge, setEdges]
  )

  const onNodeDragStop = useCallback(
    (_: any, node: any) => {
      const closeEdge = getClosestEdge(node)

      setEdges((es) => {
        const nextEdges = es.filter((e) => e.className !== "temp")

        if (
          closeEdge &&
          !nextEdges.find(
            (ne) =>
              ne.source === closeEdge.source && ne.target === closeEdge.target
          )
        ) {
          nextEdges.push(closeEdge)
        }

        return nextEdges
      })
    },
    [getClosestEdge]
  )

  const onConnectStart = useCallback((_: any, nodeId: any) => {
    console.log("ewcq", _, nodeId)
    connectingNodeId.current = nodeId
  }, [])

  const handleAddNode = (inputPosition: string, outputPosition: string) => {
    const input =
      inputPosition === "left"
        ? Position.Left
        : inputPosition === "right"
        ? Position.Right
        : Position.Top
    const output =
      outputPosition === "left"
        ? Position.Left
        : outputPosition === "right"
        ? Position.Right
        : outputPosition === "top"
        ? Position.Top
        : Position.Bottom

    const newNode = {
      id: (nodes.length + 1).toString(),
      sourcePosition: output,
      targetPosition: input,
      type: inputPosition === "" ? "input" : "default",
      data: {
        label: (
          <div className="w-full text-left">
            <div className="text-[10px] mb-2">Position</div>
            <div className="flex items-center gap-1">
              <Image
                alt="profile picture"
                height={100}
                width={200}
                className="w-[28px] h-[28px] object-cover rounded-full border border-primary shrink-0"
                src="/avatar-colored.svg"
              />
              <p className="font-normal">Name</p>
            </div>
          </div>
        ),
      },
      position: { x: 50, y: 0 }, // Set the initial position as needed
    }

    setNodes((nds) => [...nds, newNode])
  }

  const onConnectEnd = useCallback(
    (event: any) => {
      if (!connectingNodeId.current) {
        return
      }

      const targetIsPane = event.target.classList.contains("react-flow__pane")

      if (targetIsPane) {
        // we need to remove the wrapper bounds, in order to get the correct position
        const newId = getId()
        const newNode = {
          id: newId,
          position: screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          }),
          data: {
            label: (
              <div className="w-full text-left">
                <div className="text-[10px] mb-2">Position</div>
                <div className="flex items-center gap-1">
                  <Image
                    alt="profile picture"
                    height={100}
                    width={200}
                    className="w-[28px] h-[28px] object-cover rounded-full border border-primary shrink-0"
                    src="/avatar-colored.svg"
                  />
                  <p className="font-normal">Name</p>
                </div>
              </div>
            ),
          },
          origin: [0.5, 0.0],
        }

        setNodes((nds) => nds.concat(newNode))
        setEdges((eds) =>
          eds.concat({ id: newId, source: id.toString(), target: newId })
        )
      }
    },
    [screenToFlowPosition]
  )

  const onNodeClick = (event: any, node: any) => {
    setDialogOpen(true)
    setSelectedNode(node)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setSelectedNode(null)
  }

  return (
    <>
      <div className="wrapper" ref={reactFlowWrapper}>
        <Button
          variant="ghost"
          onClick={() => setShowBuilder(!showBuilder)}
          className="float-right"
        >
          <ChevronsLeft size={16} className="mr-2" />
          Build
        </Button>
        <RTG.CSSTransition
          in={showBuilder}
          timeout={300}
          classNames="slide-in-right"
          unmountOnExit={true}
        >
          <div className="fixed right-0 bg-white flex flex-wrap w-[276px] h-fit gap-3 p-3 z-10">
            <Button
              onClick={() => handleAddNode("", "bottom")}
              variant="ghost"
              className="w-[120px]"
            >
              Bottom
            </Button>
            <Button
              onClick={() => handleAddNode("top", "bottom")}
              variant="ghost"
              className="w-[120px]"
            >
              Top Bottom
            </Button>
            <Button
              onClick={() => handleAddNode("top", "left")}
              variant="ghost"
              className="w-[120px]"
            >
              Top Left
            </Button>
            <Button
              onClick={() => handleAddNode("top", "right")}
              variant="ghost"
              className="w-[120px]"
            >
              Top Right
            </Button>
            <Button
              onClick={() => handleAddNode("left", "right")}
              variant="ghost"
              className="w-[120px]"
            >
              Left Right
            </Button>
            <Button
              onClick={() => handleAddNode("left", "bottom")}
              variant="ghost"
              className="w-[120px]"
            >
              Left Bottom
            </Button>
            <Button
              onClick={() => handleAddNode("right", "bottom")}
              variant="ghost"
              className="float-right"
            >
              Right Bottom
            </Button>
            <Button
              onClick={() => handleAddNode("left", "top")}
              variant="ghost"
              className="float-right"
            >
              Left Top
            </Button>
          </div>
        </RTG.CSSTransition>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          fitView={false}
          fitViewOptions={{ padding: 2 }}
          nodeOrigin={[0.5, 0]}
          onNodeClick={onNodeClick}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
        >
          <Background />
        </ReactFlow>
      </div>
      {selectedNode && (
        <Dialog open={dialogOpen} onOpenChange={closeDialog}>
          <DialogContent className="p-0 gap-0 max-w-md">
            <DialogHeader className="border-b p-4">
              <DialogTitle className="flex justify-around">
                Choose member
              </DialogTitle>
            </DialogHeader>
            <div className="p-6">
              <SelectUser userId={userId} onChange={setUserId} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

export default () => (
  <ReactFlowProvider>
    <Structure />
  </ReactFlowProvider>
)
