import { useState, useEffect } from "react"
import { Graph } from '@antv/x6'
import '@antv/x6-react-shape'
import { Slider, Button, Select, Row, Col } from 'antd'
import 'antd/dist/antd.css'
import { StepBackwardOutlined, StepForwardOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import mapData from './map.json'
import { Board, BackGroundImage, MapperNode, Code, Log, VGA, LogAndVGA } from "./components"

import picture1 from '../../images/pic1.png'
import picture2 from '../../images/pic2.png'
import picture3 from '../../images/pic3.png'
import picture4 from '../../images/pic4.png'
import picture5 from '../../images/pic5.png'
import picture6 from '../../images/pic6.png'

const _ = require('lodash')

function Image({
  url,
  width
}) {
  const [mouseEnterStyle, setMouseEnterStyle] = useState({})
  return (
    <img
      style={{
        ...mouseEnterStyle
      }}
      src={url}
      width={width}
      onMouseEnter={() => {
        setMouseEnterStyle({
          boxShadow: '0 0 25px #03e9f4',
          backgroundColor: 'rgba(3,233,244,0.3)',
        })
      }}
      onMouseLeave={() => {
        setMouseEnterStyle({})
      }}
    />
  )
}

export default function Cpu() {
  const [cycle, setCycle] = useState(0)
  const [maxCycle, setMaxCycle] = useState(0)
  const [graphInstance, setGraphInstance] = useState(null)
  const [mapperEvent, setMapperEvent] = useState({})
  const [codeEvent, setCodeEvent] = useState({})
  const [currentDisplayCodeNode, setCurrentDisplayCodeNode] = useState(null)

  const [isStart, setIsStart] = useState(false)
  const [intervalInstance, setIntervalInstance] = useState(null)

  const [hasBug, setHasBug] = useState(false)
  const [program, setProgram] = useState("linux")

  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (cycle === maxCycle) {
      clearInterval(intervalInstance);
      setIsStart(false)
    } else if (cycle > maxCycle) {
      clearInterval(intervalInstance);
      setCycle(maxCycle)
      setIsStart(false)
    }
  }, [cycle, maxCycle, isStart])

  useEffect(() => {
    const debugFile = hasBug ? "with_bug" : "without_bug";
    fetch(`./programs/${program}/${debugFile}/registers.txt`)
      .then(res => res.text())
      .then(txt => {
        const registerValues = txt.split("\n");
        let max = 0;
        for (let i = registerValues.length - 1; i >= 0; i--) {
          const value = registerValues[i]
          const startIndex = value.indexOf("(");
          if (startIndex > -1) {
            const endIndex = value.indexOf(",")
            const num = parseInt(value.slice(startIndex + 1, endIndex).trim());
            if (typeof num === "number") {
              max = num
              break;
            }
          }
        }
        setMaxCycle(max)
      })
  }, [hasBug, program])

  useEffect(() => {
    const { id } = codeEvent
    if (id && graphInstance) {
      let flag = false
      if (currentDisplayCodeNode) {
        graphInstance.removeNode(currentDisplayCodeNode + '-code')
        setCurrentDisplayCodeNode(null)
        if (id !== currentDisplayCodeNode) {
          flag = true
        }
      } else {
        flag = true
      }
      if (flag) {
        graphInstance.addNode({
          id: id + '-code',
          x: 900,
          y: 50,
          shape: 'react-shape',
          component:
            <Code id={id} cycle={cycle} />
        })
        setCurrentDisplayCodeNode(id)
      }
      setCodeEvent({})
    }
  }, [codeEvent])

  useEffect(() => {
    if (graphInstance && currentDisplayCodeNode) {
      graphInstance.removeNode(currentDisplayCodeNode + '-code')
      graphInstance.addNode({
        id: currentDisplayCodeNode + '-code',
        x: 900,
        y: 50,
        shape: 'react-shape',
        component:
          <Code id={currentDisplayCodeNode} cycle={cycle} />
      })
    }
  }, [graphInstance, program, hasBug, cycle])

  // useEffect(() => {
  //   const { id, e } = mapperEvent
  //   if (id && e && graphInstance && mapData) {
  //     if (e === 'add') {
  //       const map = mapData[id]
  //       if (map) {
  //         const { node: { x, y, width, height }, edges } = map
  //         const mapper = graphInstance.addNode({
  //           id: id + '-mapper',
  //           x,
  //           y,
  //           shape: 'react-shape',
  //           component:
  //             <MapperNode width={width} height={height} />
  //         })
  //         edges.forEach((edge, index) => {
  //           const { source, target } = edge
  //           graphInstance.addEdge({
  //             id: id + '-edge' + index,
  //             source,
  //             target,
  //             shape: 'green-edge'
  //           })
  //         })

  //       }
  //     } else if (e === 'delete') {
  //       graphInstance.removeNode(id + '-mapper')
  //       graphInstance.removeEdge(id + '-edge0')
  //       graphInstance.removeEdge(id + '-edge1')
  //       graphInstance.removeEdge(id + '-edge2')
  //       graphInstance.removeEdge(id + '-edge3')
  //     }

  //     setMapperEvent({})
  //   }
  // }, [mapperEvent, graphInstance, mapData])

  useEffect(() => {
    const graph = new Graph({
      container: document.getElementById('container'),
      grid: true,
      scroller: {
        enabled: true,
      },
      mousewheel: {
        enabled: true,
        modifiers: ['ctrl', 'meta'],
      },
    })
    graph.addNode({
      id: 'background',
      x: 0,
      y: 150,
      shape: 'react-shape',
      component: <BackGroundImage />,
    })
    const image1Node = graph.addNode({
      id: 'image1-node',
      x: 650,
      y: 700,
      shape: 'image-node',
      component:
        <Image url={picture1} width={50} />,
      ports: {
        items: [
          {
            id: "image1-port1",
            group: 'port',
            args: {
              x: 16,
              y: -5,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "image1-port2",
            group: 'port',
            args: {
              x: 21,
              y: -5,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "image1-port3",
            group: 'port',
            args: {
              x: 26,
              y: -5,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "image1-port4",
            group: 'port',
            args: {
              x: 31,
              y: -5,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
        ]
      }
    })
    const image2Node = graph.addNode({
      id: 'image2-node',
      x: 700,
      y: 750,
      shape: 'image-node',
      component:
        <Image url={picture2} width={100} />,
      ports: {
        items: [
          {
            id: "image2-port1",
            group: 'port',
            args: {
              x: 41,
              y: -5,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "image2-port2",
            group: 'port',
            args: {
              x: 46,
              y: -5,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "image2-port3",
            group: 'port',
            args: {
              x: 51,
              y: -5,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "image2-port4",
            group: 'port',
            args: {
              x: 56,
              y: -5,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
        ]
      }
    })
    const image3Node = graph.addNode({
      id: 'image3-node',
      x: 570,
      y: 730,
      shape: 'image-node',
      component:
        <Image url={picture3} width={70} />,
      ports: {
        items: [
          {
            id: "image3-port1",
            group: 'port',
            args: {
              x: 26,
              y: 0,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "image3-port2",
            group: 'port',
            args: {
              x: 31,
              y: 0,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "image3-port3",
            group: 'port',
            args: {
              x: 36,
              y: 0,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "image3-port4",
            group: 'port',
            args: {
              x: 41,
              y: 0,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
        ]
      }
    })
    // const image6Node = graph.addNode({
    //   id: 'image6-node',
    //   x: 850,
    //   y: 700,
    //   shape: 'image-node',
    //   component:
    //     <LogAndVGA />,
    //   ports: {
    //     items: [
    //       {
    //         id: "image6-port1",
    //         group: 'port',
    //         args: {
    //           x: 91,
    //           y: -5,
    //         },
    //         size: {
    //           width: 3,
    //           height: 3,
    //         },
    //       },
    //       {
    //         id: "image6-port2",
    //         group: 'port',
    //         args: {
    //           x: 96,
    //           y: -5,
    //         },
    //         size: {
    //           width: 3,
    //           height: 3,
    //         },
    //       },
    //       {
    //         id: "image6-port3",
    //         group: 'port',
    //         args: {
    //           x: 101,
    //           y: -5,
    //         },
    //         size: {
    //           width: 3,
    //           height: 3,
    //         },
    //       },
    //       {
    //         id: "image6-port4",
    //         group: 'port',
    //         args: {
    //           x: 106,
    //           y: -5,
    //         },
    //         size: {
    //           width: 3,
    //           height: 3,
    //         },
    //       },
    //     ]
    //   }
    // })

    const boardNode = graph.addNode({
      id: 'board',
      x: 250,
      y: 0,
      shape: 'board-node',
      component:
        <Board
          handleNodeDoubleClick={handleNodeDoubleClick}
          handleNodeContextMenu={handleNodeContextMenu}
          handleNodeMouseEnter={handleNodeMouseEnter}
          handleNodeMouseLeave={handleNodeMouseLeave}
          hasError={hasError}
        />,
      ports: {
        items: [
          {
            id: "ULIFE-port1",
            group: 'port',
            args: {
              x: 175,
              y: 733,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "ULIFE-port2",
            group: 'port',
            args: {
              x: 180,
              y: 731,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "ULIFE-port3",
            group: 'port',
            args: {
              x: 185,
              y: 729,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "ULIFE-port4",
            group: 'port',
            args: {
              x: 190,
              y: 727,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "AXI4-VGA-port1",
            group: 'port',
            args: {
              x: 228,
              y: 708,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "AXI4-VGA-port2",
            group: 'port',
            args: {
              x: 233,
              y: 706,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "AXI4-VGA-port3",
            group: 'port',
            args: {
              x: 238,
              y: 704,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "AXI4-VGA-port4",
            group: 'port',
            args: {
              x: 243,
              y: 702,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "ELIFE-port1",
            group: 'port',
            args: {
              x: 281,
              y: 683,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "ELIFE-port2",
            group: 'port',
            args: {
              x: 286,
              y: 681,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "ELIFE-port3",
            group: 'port',
            args: {
              x: 291,
              y: 679,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "ELIFE-port4",
            group: 'port',
            args: {
              x: 296,
              y: 677,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "GPIO-port1",
            group: 'port',
            args: {
              x: 335,
              y: 657,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "GPIO-port2",
            group: 'port',
            args: {
              x: 340,
              y: 655,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "GPIO-port3",
            group: 'port',
            args: {
              x: 345,
              y: 653,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "GPIO-port4",
            group: 'port',
            args: {
              x: 350,
              y: 651,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "BRAM-port1",
            group: 'port',
            args: {
              x: 388,
              y: 632,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "BRAM-port2",
            group: 'port',
            args: {
              x: 393,
              y: 630,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "BRAM-port3",
            group: 'port',
            args: {
              x: 398,
              y: 628,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "BRAM-port4",
            group: 'port',
            args: {
              x: 403,
              y: 626,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "DDR-port1",
            group: 'port',
            args: {
              x: 442,
              y: 606,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "DDR-port2",
            group: 'port',
            args: {
              x: 447,
              y: 604,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "DDR-port3",
            group: 'port',
            args: {
              x: 452,
              y: 602,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
          {
            id: "DDR-port4",
            group: 'port',
            args: {
              x: 457,
              y: 600,
            },
            size: {
              width: 3,
              height: 3,
            },
          },
        ]
      }
    })

    graph.addEdge({
      shape: 'green-edge',
      source: { cell: boardNode, port: 'BRAM-port1' },
      target: { cell: 'image1-node', port: 'image1-port1' },
      router: 'orth'
    })
    graph.addEdge({
      shape: 'green-edge',
      source: { cell: boardNode, port: 'BRAM-port2' },
      target: { cell: 'image1-node', port: 'image1-port2' },
      router: 'orth'
    })
    graph.addEdge({
      shape: 'green-edge',
      source: { cell: boardNode, port: 'BRAM-port3' },
      target: { cell: 'image1-node', port: 'image1-port3' },
      router: 'orth'
    })
    graph.addEdge({
      shape: 'green-edge',
      source: { cell: boardNode, port: 'BRAM-port4' },
      target: { cell: 'image1-node', port: 'image1-port4' },
      router: 'orth'
    })
    graph.addEdge({
      shape: 'green-edge',
      source: { cell: boardNode, port: 'DDR-port1' },
      target: { cell: 'image2-node', port: 'image2-port1' },
      router: 'orth'
    })
    graph.addEdge({
      shape: 'green-edge',
      source: { cell: boardNode, port: 'DDR-port2' },
      target: { cell: 'image2-node', port: 'image2-port2' },
      router: 'orth'
    })
    graph.addEdge({
      shape: 'green-edge',
      source: { cell: boardNode, port: 'DDR-port3' },
      target: { cell: 'image2-node', port: 'image2-port3' },
      router: 'orth'
    })
    graph.addEdge({
      shape: 'green-edge',
      source: { cell: boardNode, port: 'DDR-port4' },
      target: { cell: 'image2-node', port: 'image2-port4' },
      router: 'orth'
    })
    graph.addEdge({
      shape: 'green-edge',
      source: { cell: boardNode, port: 'ELIFE-port1' },
      target: { cell: 'image3-node', port: 'image3-port1' },
      router: 'orth'
    })
    graph.addEdge({
      shape: 'green-edge',
      source: { cell: boardNode, port: 'ELIFE-port2' },
      target: { cell: 'image3-node', port: 'image3-port2' },
      router: 'orth'
    })
    graph.addEdge({
      shape: 'green-edge',
      source: { cell: boardNode, port: 'ELIFE-port3' },
      target: { cell: 'image3-node', port: 'image3-port3' },
      router: 'orth'
    })
    graph.addEdge({
      shape: 'green-edge',
      source: { cell: boardNode, port: 'ELIFE-port4' },
      target: { cell: 'image3-node', port: 'image3-port4' },
      router: 'orth'
    })

    // graph.addEdge({
    //   shape: 'green-edge',
    //   source: { cell: boardNode, port: 'GPIO-port1' },
    //   target: { cell: 'image6-node', port: 'image6-port1' },
    //   router: 'orth'
    // })
    // graph.addEdge({
    //   shape: 'green-edge',
    //   source: { cell: boardNode, port: 'GPIO-port2' },
    //   target: { cell: 'image6-node', port: 'image6-port2' },
    //   router: 'orth'
    // })
    // graph.addEdge({
    //   shape: 'green-edge',
    //   source: { cell: boardNode, port: 'GPIO-port3' },
    //   target: { cell: 'image6-node', port: 'image6-port3' },
    //   router: 'orth'
    // })
    // graph.addEdge({
    //   shape: 'green-edge',
    //   source: { cell: boardNode, port: 'GPIO-port4' },
    //   target: { cell: 'image6-node', port: 'image6-port4' },
    //   router: 'orth'
    // })
    setGraphInstance(graph)
  }, [])


  useEffect(() => {
    if (graphInstance) {
      graphInstance.removeNode('image5-node');
      graphInstance.removeNode('image4-node');


      const image4Node = graphInstance.addNode({
        id: 'image4-node',
        x: 490,
        y: 850,
        shape: 'image-node',
        component:
          <VGA
            program={program}
            hasbug={hasBug}
            cycle={cycle}
            changeStyle={changeStyle}
            removeErrorCircle={removeErrorCircle} />,
        ports: {
          items: [
            {
              id: "image4-port1",
              group: 'port',
              args: {
                x: 41,
                y: -5,
              },
              size: {
                width: 3,
                height: 3,
              },
            },
            {
              id: "image4-port2",
              group: 'port',
              args: {
                x: 46,
                y: -5,
              },
              size: {
                width: 3,
                height: 3,
              },
            },
            {
              id: "image4-port3",
              group: 'port',
              args: {
                x: 51,
                y: -5,
              },
              size: {
                width: 3,
                height: 3,
              },
            },
            {
              id: "image4-port4",
              group: 'port',
              args: {
                x: 56,
                y: -5,
              },
              size: {
                width: 3,
                height: 3,
              },
            },
          ]
        }
      })

      graphInstance.addEdge({
        id: 'axi4vga1',
        shape: 'green-edge',
        source: { cell: 'board', port: 'AXI4-VGA-port1' },
        target: { cell: image4Node, port: 'image4-port1' },
        router: 'orth'
      })
      graphInstance.addEdge({
        id: 'axi4vga2',
        shape: 'green-edge',
        source: { cell: 'board', port: 'AXI4-VGA-port2' },
        target: { cell: image4Node, port: 'image4-port2' },
        router: 'orth'
      })
      graphInstance.addEdge({
        id: 'axi4vga3',
        shape: 'green-edge',
        source: { cell: 'board', port: 'AXI4-VGA-port3' },
        target: { cell: image4Node, port: 'image4-port3' },
        router: 'orth'
      })
      graphInstance.addEdge({
        id: 'axi4vga4',
        shape: 'green-edge',
        source: { cell: 'board', port: 'AXI4-VGA-port4' },
        target: { cell: image4Node, port: 'image4-port4' },
        router: 'orth'
      })

      const image5Node = graphInstance.addNode({
        id: 'image5-node',
        x: 150,
        y: 770,
        shape: 'image-node',
        component:
          <Log program={program} hasbug={hasBug} cycle={cycle} />,
        ports: {
          items: [
            {
              id: "image5-port1",
              group: 'port',
              args: {
                x: 41,
                y: -5,
              },
              size: {
                width: 3,
                height: 3,
              },
            },
            {
              id: "image5-port2",
              group: 'port',
              args: {
                x: 46,
                y: -5,
              },
              size: {
                width: 3,
                height: 3,
              },
            },
            {
              id: "image5-port3",
              group: 'port',
              args: {
                x: 51,
                y: -5,
              },
              size: {
                width: 3,
                height: 3,
              },
            },
            {
              id: "image5-port4",
              group: 'port',
              args: {
                x: 56,
                y: -5,
              },
              size: {
                width: 3,
                height: 3,
              },
            },
          ]
        }
      })

      graphInstance.addEdge({
        shape: 'green-edge',
        source: { cell: 'board', port: 'ULIFE-port1' },
        target: { cell: 'image5-node', port: 'image5-port1' },
        router: 'orth'
      })
      graphInstance.addEdge({
        shape: 'green-edge',
        source: { cell: 'board', port: 'ULIFE-port2' },
        target: { cell: 'image5-node', port: 'image5-port2' },
        router: 'orth'
      })
      graphInstance.addEdge({
        shape: 'green-edge',
        source: { cell: 'board', port: 'ULIFE-port3' },
        target: { cell: 'image5-node', port: 'image5-port3' },
        router: 'orth'
      })
      graphInstance.addEdge({
        shape: 'green-edge',
        source: { cell: 'board', port: 'ULIFE-port4' },
        target: { cell: 'image5-node', port: 'image5-port4' },
        router: 'orth'
      })
    }
  }, [graphInstance, program, hasBug, cycle, hasError])

  const handleNodeDoubleClick = (id) => {
    console.log(id)
  }

  const handleNodeContextMenu = (id) => {
    setCodeEvent({ id })
  }

  const handleNodeMouseEnter = (id) => {
    if (mapData.hasOwnProperty(id)) {
      setMapperEvent({ id, e: 'add' })
    }
  }

  const handleNodeMouseLeave = (id) => {
    if (mapData.hasOwnProperty(id)) {
      setMapperEvent({ id, e: 'delete' })
    }
  }

  const changeStyle = () => {
    graphInstance.removeEdge('axi4vga1')
    graphInstance.removeEdge('axi4vga2')
    graphInstance.removeEdge('axi4vga3')
    graphInstance.removeEdge('axi4vga4')

    graphInstance.addEdge({
      id: 'axi4vga1',
      shape: 'red-edge',
      source: { cell: 'board', port: 'AXI4-VGA-port1' },
      target: { cell: 'image4-node', port: 'image4-port1' },
      router: 'orth'
    })
    graphInstance.addEdge({
      id: 'axi4vga2',
      shape: 'red-edge',
      source: { cell: 'board', port: 'AXI4-VGA-port2' },
      target: { cell: 'image4-node', port: 'image4-port2' },
      router: 'orth'
    })
    graphInstance.addEdge({
      id: 'axi4vga3',
      shape: 'red-edge',
      source: { cell: 'board', port: 'AXI4-VGA-port3' },
      target: { cell: 'image4-node', port: 'image4-port3' },
      router: 'orth'
    })
    graphInstance.addEdge({
      id: 'axi4vga4',
      shape: 'red-edge',
      source: { cell: 'board', port: 'AXI4-VGA-port4' },
      target: { cell: 'image4-node', port: 'image4-port4' },
      router: 'orth'
    })

    graphInstance.addNode({
      shape: 'circle',
      x: 703,
      y: 182,
      width: 20,
      height: 20,
      id: 'error-circle',
      attrs: {
        body: {
          fill: 'rgba(255,0,0,0.5)',
          stroke: 'rgba(255,0,0,0.5)',
        },
      },
    })
  }

  const removeErrorCircle = () => {
    if (graphInstance.hasCell('error-circle')) {
      graphInstance.removeNode('error-circle')
    }
  }

  return (
    <div style={{ height: '100%' }}>
      <Row style={{ margin: '5px' }}>
        <Col span={13}>
          <Slider
            defaultValue={0}
            value={cycle}
            min={0}
            max={maxCycle}
            onChange={(value) => {
              setCycle(value)
            }}
            // onAfterChange={(value) => {
            //   setCycle(value)
            // }}
            tipFormatter={(value) => {
              return value
            }}
          />
        </Col>
        <Col span={1}></Col>
        <Col span={1}>
          {/* {cycle === 0 ?
            <Button type="primary" shape="circle" icon={<StepBackwardOutlined />} disabled /> :
            <Button type="primary" shape="circle" icon={<StepBackwardOutlined />}
              onClick={() => {
                setCycle(prev => prev - 1)
              }}
            />} */}
          <Button type="primary" shape="circle" icon={<StepBackwardOutlined />}
            disabled={cycle === 0 ? true : false}
            onClick={() => {
              setCycle(prev => prev - 1)
            }}
          />
        </Col>
        <Col span={1}>
          {isStart ?
            <Button type="primary" shape="circle" icon={<PauseCircleOutlined />}
              disabled={cycle === maxCycle ? true : false}
              onClick={() => {
                setIsStart(false)
                clearInterval(intervalInstance)
                setIntervalInstance(null)
              }}
            /> :
            <Button type="primary" shape="circle" icon={<PlayCircleOutlined />}
              disabled={cycle === maxCycle ? true : false}
              onClick={() => {
                setIsStart(true)
                let step = Math.floor(maxCycle / 100)
                setIntervalInstance(
                  setInterval(() => {
                    setCycle(prev => prev + step)
                  }, 1000)
                )
              }}
            />
          }
        </Col>
        <Col span={1}>
          {/* {cycle === maxCycle ?
            <Button type="primary" shape="circle" icon={<StepForwardOutlined />} disabled /> :
            <Button type="primary" shape="circle" icon={<StepForwardOutlined />}
              onClick={() => {
                setCycle(prev => prev + 1)
              }}
            />
          } */}
          <Button type="primary" shape="circle" icon={<StepForwardOutlined />}
            disabled={cycle === maxCycle ? true : false}
            onClick={() => {
              setCycle(prev => prev + 1)
            }}
          />
        </Col>
        <Col span={4}>运行模式:
          <Select defaultValue="无bug" style={{ width: 120 }}
            onChange={(value) => {
              setHasBug(value);
            }}>
            <Select.Option value={false}>无bug</Select.Option>
            <Select.Option value={true}>有bug</Select.Option>
          </Select>
        </Col>
        <Col span={3}>
          <Select defaultValue="linux" style={{ width: 120 }}
            onChange={(value) => {
              setProgram(value);
            }}>
            <Select.Option value="linux">linux</Select.Option>
            <Select.Option value="microbench">microbench</Select.Option>
          </Select>
        </Col>
      </Row>
      <div id='container' style={{ width: '3000px', height: '3000px' }} />
    </div>
  )
}

Graph.registerNode(
  'image-node',
  {
    inherit: 'react-shape',
    ports: {
      groups: {
        port: {
          position: {
            name: 'absolute',
          },
          attrs: {
            portBody: {
              magnet: 'passive',
              fill: 'gainsboro',
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
  true
)

Graph.registerNode(
  'board-node',
  {
    inherit: 'react-shape',
    ports: {
      groups: {
        port: {
          position: {
            name: 'absolute',
          },
          attrs: {
            portBody: {
              magnet: 'passive',
              // fill: 'gainsboro',
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
  true
)

Graph.registerEdge(
  'red-edge',
  {
    inherit: 'edge',
    markup: [
      {
        tagName: 'path',
        selector: 'stroke',
      },
    ],
    attrs: {
      stroke: {
        fill: 'none',
        stroke: 'red',
        connection: true,
        strokeWidth: 1,
        strokeLinecap: 'round',
      },
    },
  },
  true,
)

Graph.registerEdge(
  'green-edge',
  {
    inherit: 'edge',
    markup: [
      {
        tagName: 'path',
        selector: 'stroke',
      },
    ],
    attrs: {
      stroke: {
        fill: 'none',
        stroke: 'blue',
        connection: true,
        strokeWidth: 1,
        strokeLinecap: 'round',
      },
    },
  },
  true,
)

Graph.registerPortLayout(
  'mapperport',
  (portsPositionArgs, elemBBox) => {
    // console.log(portsPositionArgs, elemBBox)
    return portsPositionArgs.map((arg, index) => {
      const { x, y } = arg
      return {
        position: {
          x,
          y
        },
        angle: 0,
      }
    })
  },
  true,
)