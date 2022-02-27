import { Node } from '@antv/x6'

export class Group extends Node {
  constructor(props){
    super(props)
    this.collapsed=false
    this.expandSize={}
  }
  postprocess() {
    this.toggleCollapse(false)
  }

  isCollapsed() {
    return this.collapsed
  }

  toggleCollapse(collapsed) {
    const target = collapsed == null ? !this.collapsed : collapsed
    if (target) {
      this.attr('buttonSign', { d: 'M 1 5 9 5 M 5 1 5 9' })
      this.expandSize = this.getSize()
      this.resize(100, 32)
    } else {
      this.attr('buttonSign', { d: 'M 2 5 8 5' })
      if (this.expandSize) {
        this.resize(this.expandSize.width, this.expandSize.height)
      }
    }
    this.collapsed = target
  }
}

Group.config({
  markup: [
    {
      tagName: 'rect',
      selector: 'body',
    },
    {
      tagName: 'text',
      selector: 'label',
    },
    {
      tagName: 'g',
      selector: 'buttonGroup',
      children: [
        {
          tagName: 'rect',
          selector: 'button',
          attrs: {
            'pointer-events': 'visiblePainted',
          },
        },
        {
          tagName: 'path',
          selector: 'buttonSign',
          attrs: {
            fill: 'none',
            'pointer-events': 'none',
          },
        },
      ],
    },
  ],
  attrs: {
    body: {
      refWidth: '100%',
      refHeight: '100%',
      strokeWidth: 1,
      fill: '#ffffff',
      stroke: 'none',
    },
    buttonGroup: {
      refX: 8,
      refY: 8,
    },
    button: {
      height: 14,
      width: 16,
      rx: 2,
      ry: 2,
      fill: '#f5f5f5',
      stroke: '#ccc',
      cursor: 'pointer',
      event: 'node:collapse',
    },
    buttonSign: {
      refX: 3,
      refY: 2,
      stroke: '#808080',
    },
    label: {
      fontSzie: 12,
      fill: '#fff',
      refX: 32,
      refY: 10,
    },
  },
})

export function createGroup(
  graph,
  id,
  label,
  x,
  y,
  width,
  height,
  fill,
  stroke
) {
  const group = new Group({
    id,
    x,
    y,
    width,
    height,
    attrs: {
      body: { fill, stroke },
      label: { text: label },
    },
  })
  graph.addNode(group)
  return group
}

export function createNode(
  graph,
  id,
  label,
  x,
  y,
  width,
  height,
  fill,
) {
  return graph.addNode({
    id,
    x,
    y,
    width,
    height,
    attrs: {
      body: {
        fill: fill || 'blue',
        stroke: 'none',
      },
      label: {
        text: label,
        fill: '#fff',
        fontSize: 12,
      },
    },
  })
}

export function createEdge(
  graph,
  id,
  label,
  source,
  target,
  vertices,
) {
  return graph.addEdge({
    id,
    source,
    target,
    vertices,
    label: label,
    attrs: {
      label: {
        fontSize: 12,
      },
    },
  })
}
