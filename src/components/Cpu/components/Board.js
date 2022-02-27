import React, { useEffect, useState } from "react"
import { Graph } from '@antv/x6'
import elkdata from '../elkdata.json'
import customdata from '../elk.json'
import map from '../map.json'
import ELK from 'elkjs'

const elk = new ELK()
const portIdToNodeIdMap = {}
var _ = require('lodash')

function randomString(e) {    
  e = e || 32;
  var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
  a = t.length,
  n = "";
  for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
  return n
}

function getPorts(node) {
  let newPorts = _.cloneDeep(node.ports)
  let portCount = { "NORTH": { count: 0, sum: 0 }, "SOUTH": { count: 0, sum: 0 }, "EAST": { count: 0, sum: 0 }, "WEST": { count: 0, sum: 0 } }
  node.ports.forEach(port => {
    let side = port['layoutOptions']['port.side']
    if (side === "NORTH" || side === "SOUTH") {
      const { width } = port
      portCount[side].sum += width
      portCount[side].count++
    } else if (side === "EAST" || side === "WEST") {
      const { height } = port
      portCount[side].sum += height
      portCount[side].count++
    }
  })
  const { width: nodeWidth, height: nodeHeight, x: nodeX, y: nodeY } = node
  for (let side in portCount) {
    const count = portCount[side].count
    if (count > 0) {
      if (side === "NORTH" || side === "SOUTH") {
        const sum = portCount[side].sum
        let interval = 0
        let start = 0
        if (nodeWidth > sum) {
          interval = (nodeWidth - sum) / (count + 1)
          start = interval
        } else {
          start = (nodeWidth - sum) / 2
          interval = 0
        }
        node.ports.forEach((port, index) => {
          if (port['layoutOptions']['port.side'] === "NORTH" && side === "NORTH") {
            newPorts[index]["x"] = start
            newPorts[index]["y"] = - port.height
            start = start + interval + newPorts[index]["width"]
          } else if (port['layoutOptions']['port.side'] === "SOUTH" && side === "SOUTH") {
            newPorts[index]["x"] = start
            newPorts[index]["y"] = nodeHeight
            start = start + interval + newPorts[index]["width"]
          }
        })
      } else if (side === "EAST" || side === "WEST") {
        const sum = portCount[side].sum
        let interval = 0
        let start = 0
        if (nodeHeight > sum) {
          interval = (nodeHeight - sum) / (count + 1)
          start = interval
        } else {
          start = (nodeHeight - sum) / 2
          interval = 0
        }
        node.ports.forEach((port, index) => {
          if (port['layoutOptions']['port.side'] === "EAST" && side === "EAST") {
            newPorts[index]["x"] = nodeWidth
            newPorts[index]["y"] = start
            start = start + interval + newPorts[index]["height"]
          } else if (port['layoutOptions']['port.side'] === "WEST" && side === "WEST") {
            newPorts[index]["x"] = - port.width
            newPorts[index]["y"] = start
            start = start + interval + newPorts[index]["height"]
          }
        })
      }
    }
  }
  return newPorts
}

function generateNodes(graph, parentNode, offset, nodes, newNodes) {
  nodes.forEach((child, index) => {
    const ports = getPorts(child)
    newNodes[index].ports = ports
    const node = graph.createNode({
      shape: 'elk-node',
      id: child.id,
      position: {
        x: child.x + offset.x,
        y: child.y + offset.y,
      },
      label: child.labels,
      size: {
        width: child.width,
        height: child.height,
      },
      ports: {
        items: ports.map((item) => {
          portIdToNodeIdMap[item.id] = child.id
          return {
            id: item.id,
            group: 'port',
            args: {
              x: item.x,
              y: item.y,
            },
            size: {
              width: item.width,
              height: item.height,
            },
          }
        }),
      },
    })
    parentNode.addChild(node)
  })
}

function generateEdges(graph, offset, edges, newNodes) {
  edges.forEach((edge) => {
    const sourcePortId = edge.sources[0]
    const targetPortId = edge.targets[0]
    const sourceNodeId = portIdToNodeIdMap[sourcePortId]
    const targetNodeId = portIdToNodeIdMap[targetPortId]

    const sourceNode = newNodes.find(e => e.id === sourceNodeId)
    const targetNode = newNodes.find(e => e.id === targetNodeId)
    const sourcePort = sourceNode.ports.find(e => e.id === sourcePortId)
    const targetPort = targetNode.ports.find(e => e.id === targetPortId)

    // const vertices = [
    //   {
    //     x: (sourceNode.x + sourcePort.x + sourcePort.width / 2 + targetNode.x + targetPort.x + targetPort.width / 2) / 2 + offset.x,
    //     y: sourceNode.y + sourcePort.y + sourcePort.height / 2 + offset.y
    //   },
    //   {
    //     x: (sourceNode.x + sourcePort.x + sourcePort.width / 2 + targetNode.x + targetPort.x + targetPort.width / 2) / 2 + offset.x,
    //     y: targetNode.y + targetPort.y + targetPort.height / 2 + offset.y,
    //   }
    // ]

    const vertices = edge.vertices ? edge.vertices.map(e => ({ x: e.x + offset.x, y: e.y + offset.y })) : []

    graph.addEdge({
      shape: 'elk-edge',
      source: {
        cell: sourceNodeId,
        port: sourcePortId,
      },
      target: {
        cell: targetNodeId,
        port: targetPortId,
      },
      vertices: vertices,
      // router: 'orth',
    })

  })
}

export default function Board({
  handleNodeDoubleClick,
  handleNodeContextMenu,
  handleNodeMouseEnter,
  handleNodeMouseLeave,
  hasError,
}) {
  const containerID=randomString()
  const [mouseEnterStyle, setMouseEnterStyle] = useState({})
  useEffect(() => {
    const graph = new Graph({
      container: document.getElementById(containerID),
      grid: false,
    })

    // elk.layout(elkdata,{
    //   layoutOptions: {
    //     'algorithm': 'layered',
    //     'elk.layered.nodePlacement.strategy': 'SIMPLE',
    //     'spacing.nodeNodeBetweenLayers': 10,
    //     'elk.direction': 'DOWN'
    //   },
    // }).then((res) => {
    //   console.log(res)
    //   // addChildren(graph, coreNode, { x: offsetX, y: offsetY }, res.children || [])
    //   // addEdges(graph, { x: offsetX, y: offsetY }, res.edges || [])
    // })

    const offsetX = 10
    const offsetY = 130
    const coreNode = graph.addNode({
      shape: 'custom-node',
      x: offsetX,
      y: offsetY,
      width: 650,
      height: 460,
      id:'core',
      label: 'CORE',
      attrs: {
        label: {
          refX: '50%',
          refY: '5%',
        }
      },
      ports: {
        items: [
          {
            id: "core-port1",
            group: 'port',
            args: {
              x: 400,
              y: 0,
            },
            size: {
              width: 50,
              height: 7,
            },
          },
          {
            id: "core-port2",
            group: 'port',
            args: {
              x: 50,
              y: 453,
            },
            size: {
              width: 50,
              height: 7,
            },
          },
          {
            id: "core-port3",
            group: 'port',
            args: {
              x: 430,
              y: 453,
            },
            size: {
              width: 50,
              height: 7,
            },
          }
        ]
      }
    })
    let newNodes = _.cloneDeep(customdata.children)
    generateNodes(graph, coreNode, { x: offsetX, y: offsetY }, customdata.children, newNodes)
    generateEdges(graph, { x: offsetX, y: offsetY }, customdata.edges, newNodes)

    const DIVNode = graph.addNode({
      shape: 'custom-node',
      x: 20,
      y: 10,
      width: 60,
      height: 25,
      label: 'DIV',
      // attrs: {
      //   label: {
      //     refX: '50%',
      //     refY: '50%',
      //   }
      // },
    })
    const MULTNode = graph.addNode({
      shape: 'custom-node',
      x: 270,
      y: 10,
      width: 60,
      height: 25,
      label: 'MULT',
      // attrs: {
      //   label: {
      //     refX: '50%',
      //     refY: '50%',
      //   }
      // },
    })
    const FRUNode = graph.addNode({
      shape: 'custom-node',
      x: 550,
      y: 10,
      width: 60,
      height: 25,
      label: 'FPU',
      // attrs: {
      //   label: {
      //     refX: '50%',
      //     refY: '50%',
      //   }
      // },
    })
    const SCHEDULERNode = graph.addNode({
      shape: 'custom-node',
      x: 10,
      y: 60,
      width: 650,
      height: 40,
      label: 'SCHEDULER',
      // attrs: {
      //   label: {
      //     refX: '50%',
      //     refY: '20%',
      //   }
      // },
      // ports: {
      //   items: [
      //     {
      //       id: "SCHEDULER-port1",
      //       group: 'port2',
      //       args: {
      //         x: 25,
      //         y: 40,
      //       },
      //       size: {
      //         width: 600,
      //         height: 10,
      //       },
      //     },
      //   ]
      // }
    })
    const ICACHENode = graph.addNode({
      shape: 'custom-node',
      x: 50,
      y: 620,
      width: 80,
      height: 30,
      label: 'ICACHE',
      // attrs: {
      //   label: {
      //     refX: '50%',
      //     refY: '20%',
      //   }
      // },
      // ports: {
      //   items: [
      //     {
      //       id: "ICACHE-port1",
      //       group: 'port2',
      //       args: {
      //         x: 10,
      //         y: 40,
      //       },
      //       size: {
      //         width: 80,
      //         height: 10,
      //       },
      //     },
      //   ]
      // }
    })
    const DCACHENode = graph.addNode({
      shape: 'custom-node',
      x: 430,
      y: 620,
      width: 80,
      height: 30,
      label: 'DCACHE',
      // attrs: {
      //   label: {
      //     refX: '50%',
      //     refY: '20%',
      //   }
      // },
      // ports: {
      //   items: [
      //     {
      //       id: "DCACHE-port1",
      //       group: 'port2',
      //       args: {
      //         x: 10,
      //         y: 40,
      //       },
      //       size: {
      //         width: 80,
      //         height: 10,
      //       },
      //     },
      //   ]
      // }
    })
    const AXI4CROSSBARNode = graph.addNode({
      shape: 'custom-node',
      x: 10,
      y: 680,
      width: 650,
      height: 30,
      label: 'AXI4-CROSSBAR',
      // attrs: {
      //   label: {
      //     refX: '50%',
      //     refY: '20%',
      //   }
      // },
    })
    const ULIFENode = graph.addNode({
      shape: 'custom-node',
      x: 10,
      y: 740,
      width: 80,
      height: 30,
      label: 'ULIFE',
      // attrs: {
      //   label: {
      //     refX: '50%',
      //     refY: '50%',
      //   }
      // },
    })
    const AXI4VGANode = graph.addNode({
      shape: 'custom-node',
      x: 110,
      y: 740,
      width: 80,
      height: 30,
      label: 'AXI4-VGA',
      // attrs: {
      //   label: {
      //     refX: '50%',
      //     refY: '50%',
      //   }
      // },
    })
    const ELIFENode = graph.addNode({
      shape: 'custom-node',
      x: 210,
      y: 740,
      width: 80,
      height: 30,
      label: 'ELIFE',
      // attrs: {
      //   label: {
      //     refX: '50%',
      //     refY: '50%',
      //   }
      // },
    })
    const GPIONode = graph.addNode({
      shape: 'custom-node',
      x: 310,
      y: 740,
      width: 80,
      height: 30,
      label: 'GPIO',
      // attrs: {
      //   label: {
      //     refX: '50%',
      //     refY: '50%',
      //   }
      // },
    })
    const BRAMNode = graph.addNode({
      shape: 'custom-node',
      x: 410,
      y: 740,
      width: 80,
      height: 30,
      label: 'BRAM',
      // attrs: {
      //   label: {
      //     refX: '50%',
      //     refY: '50%',
      //   }
    })
    const DDRNode = graph.addNode({
      shape: 'custom-node',
      x: 510,
      y: 740,
      width: 80,
      height: 30,
      label: 'DDR',
      // attrs: {
      //   label: {
      //     refX: '50%',
      //     refY: '50%',
      //   }
      // },
    })
    graph.addEdge({
      shape: 'custom-edge',
      source: { x: 60, y: 30 },
      target: { x: 60, y: 70 },
    })
    graph.addEdge({
      shape: 'custom-edge',
      source: { x: 300, y: 30 },
      target: { x: 300, y: 70 },
    })
    graph.addEdge({
      shape: 'custom-edge',
      source: { x: 580, y: 30 },
      target: { x: 580, y: 70 },
    })
    graph.addEdge({
      shape: 'custom-edge',
      source: { x: 435, y: 90 },
      target: { x: 435, y: 135 },
    })
    graph.addEdge({
      shape: 'custom-edge',
      source: { x: 445, y: 135 },
      target: { x: 445, y: 230 },
    })
    graph.addEdge({
      shape: 'custom-edge',
      source: { x: 80, y: 410 },
      target: { x: 80, y: 585 },
    })
    graph.addEdge({
      shape: 'custom-edge',
      source: { x: 465, y: 470 },
      target: { x: 465, y: 585 },
    })
    graph.addEdge({
      shape: 'custom-edge',
      source: { x: 80, y: 590 },
      target: { x: 80, y: 622 },
    })
    graph.addEdge({
      shape: 'custom-edge',
      source: { x: 465, y: 590 },
      target: { x: 465, y: 622 },
    })
    graph.addEdge({
      shape: 'custom-edge',
      router: 'orth',
      source: { x: 90, y: 605 },
      target: { x: 200, y: 680 },
    })
    graph.addEdge({
      shape: 'custom-edge',
      router: 'orth',
      source: { x: 460, y: 605 },
      target: { x: 300, y: 680 },
    })
    graph.addEdge({
      shape: 'custom-edge',
      source: { x: 100, y: 650 },
      target: { x: 100, y: 680 },
    })
    graph.addEdge({
      shape: 'custom-edge',
      source: { x: 470, y: 650 },
      target: { x: 470, y: 680 },
    })
    graph.addEdge({
      shape: 'custom-edge',
      source: { x: 50, y: 710 },
      target: { x: 50, y: 745 },
    })
    graph.addEdge({
      shape: 'custom-edge',
      source: { x: 150, y: 710 },
      target: { x: 150, y: 745 },
    })
    graph.addEdge({
      shape: 'custom-edge',
      source: { x: 250, y: 710 },
      target: { x: 250, y: 745 },
    })
    graph.addEdge({
      shape: 'custom-edge',
      source: { x: 350, y: 710 },
      target: { x: 350, y: 745 },
    })
    graph.addEdge({
      shape: 'custom-edge',
      source: { x: 450, y: 710 },
      target: { x: 450, y: 745 },
    })
    graph.addEdge({
      shape: 'custom-edge',
      source: { x: 550, y: 710 },
      target: { x: 550, y: 745 },
    })

    graph.on('node:dblclick', (props) => {
      const { node: { id } } = props
      handleNodeDoubleClick(id)
    })

    graph.on('node:contextmenu', (props) => {
      const { node: { id } } = props
      handleNodeContextMenu(id)
    })

    graph.on('node:mouseenter', (props) => {
      const { node: { id } } = props
      handleNodeMouseEnter(id)
    })

    graph.on('node:mouseleave', (props => {
      const { node: { id } } = props
      handleNodeMouseLeave(id)
    }))

  }, [])
  return (
    <div id={containerID}
      style={{
        transform: 'scale(0.7, 0.7) rotateY(40deg) skewY(-20deg)',
        backgroundColor: 'lightcyan',
        width: '670px',
        height: '780px',
        ...mouseEnterStyle
      }}
      onMouseEnter={() => {
        // console.log('onMouseEnter');
        setMouseEnterStyle({
          boxShadow: '0 0 50px #03e9f4'
        })
      }}
      onMouseLeave={() => {
        // console.log('onMouseLeave');
        setMouseEnterStyle({})
      }}
    />
  )
}


Graph.registerNode(
  'custom-node',
  {
    inherit: 'rect',
    attrs: {
      label: {
        fontSize: 18,
      },
    },
    ports: {
      groups: {
        port: {
          position: {
            name: 'absolute',
          },
          attrs: {
            portBody: {
              magnet: 'passive',
              fill: '#5F95FF',
              refWidth: '100%',
              refHeight: '100%',
            },
          },
          markup: [
            {
              tagName: 'rect',
              selector: 'portBody',
            },
          ],
        },
        port2: {
          position: {
            name: 'absolute',
          },
          attrs: {
            portBody: {
              magnet: 'passive',
              fill: 'gray',
              refWidth: '100%',
              refHeight: '100%',
            },
          },
          markup: [
            {
              tagName: 'rect',
              selector: 'portBody',
            },
          ],
        },
        port3: {
          position: {
            name: 'absolute',
          },
          attrs: {
            portBody: {
              magnet: 'passive',
              fill: 'gray',
              refWidth: '100%',
              refHeight: '100%',
            },
          },
          markup: [
            {
              tagName: 'rect',
              selector: 'portBody',
            },
          ],
        },
      },
    },
  },
  true,
)

Graph.registerEdge(
  'custom-edge',
  {
    inherit: 'double-edge',
    connector: 'jumpover',
    attrs: {
      line: {
        strokeWidth: 2,
        stroke: '#6A5ACD',
        sourceMarker: 'block',
        targetMarker: 'block',
        // sourceMarker: {
        //   tagName: 'path',
        //   d: 'M 10 -5 0 0 10 5 Z',
        //   // stroke: 'gray',
        //   // strokeWidth: 2,
        //   // d: 'M 0 -4 0 -10 -12 0 0 10 0 4',
        // },
        // targetMarker: {
        //   tagName: 'path',
        //   d: 'M 10 -5 0 0 10 5 Z',
        //   // stroke: 'gray',
        //   // strokeWidth: 2,
        //   // d: 'M 0 -4 0 -10 -12 0 0 10 0 4',
        // },
      },
      outline: {
        stroke: '#237804',
        strokeWidth: 0,
      },
    },
  },
  true,
)


const addChildren = (graph, parentNode, offset, children) => {
  children.forEach((child) => {
    const position = {
      x: (child.x || 0) + 30 + offset.x,
      y: (child.y || 0) + 30 + offset.y,
    }
    let label = ''
    if (typeof child.labels === 'string') {
      label = child.labels
    } else if (Array.isArray(child.labels) && child.labels[0]) {
      label = child.labels[0].text
    }
    const node = graph.createNode({
      shape: 'elk-node',
      id: child.id,
      position,
      label,
      size: {
        width: child.width || 0,
        height: child.height || 0,
      },
      ports: {
        items: (child.ports || []).map((item) => {
          portIdToNodeIdMap[item.id] = child.id
          return {
            id: item.id,
            group: 'port',
            args: {
              x: item.x,
              y: item.y,
            },
            size: {
              width: item.width || 0,
              height: item.height || 0,
            },
          }
        }),
      },
    })

    parentNode.addChild(node)
  })
}


const addEdges = (graph, offset, edges) => {
  edges.forEach((edge) => {
    const { bendPoints = [] } = edge.sections[0]

    bendPoints.map((bendPoint) => {
      bendPoint.x += 30 + offset.x
      bendPoint.y += 30 + offset.y
    })

    const sourcePortId = edge.sources[0]
    const targetPortId = edge.targets[0]
    const sourceNodeId = portIdToNodeIdMap[sourcePortId]
    const targetNodeId = portIdToNodeIdMap[targetPortId]

    graph.addEdge({
      shape: 'elk-edge',
      source: {
        cell: sourceNodeId,
        port: sourcePortId,
      },
      target: {
        cell: targetNodeId,
        port: targetPortId,
      },
      vertices: bendPoints,
    })

  })
}

Graph.registerNode(
  'elk-node',
  {
    inherit: 'rect',
    attrs: {
      body: {
        fill: '#EFF4FF',
        stroke: '#5F95FF',
        strokeWidth: 1,
      },
      label: {
        fontSize: 20,
      },
    },
    ports: {
      groups: {
        port: {
          position: {
            name: 'absolute',
          },
          attrs: {
            portBody: {
              magnet: 'passive',
              fill: '#5F95FF',
              refWidth: '100%',
              refHeight: '100%',
            },
          },
          markup: [
            {
              tagName: 'rect',
              selector: 'portBody',
            },
          ],
        },
      },
    },
  },
  true,
)

Graph.registerEdge(
  'elk-edge',
  {
    inherit: 'edge',
    attrs: {
      line: {
        stroke: '#A2B1C3',
        strokeWidth: 1,
        targetMarker: {
          name: 'block',
          width: 4,
          height: 4,
        },
      },
    },
  },
  true,
)