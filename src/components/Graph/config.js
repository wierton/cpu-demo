import { Graph } from '@antv/x6'

Graph.registerNode(
  'custom-node',
  {
    width: 200,
    height: 200,
    attrs: {
      image: {
        event:'node:custom',
        // 'xlink:href':
        //   'https://gw.alipayobjects.com/zos/antfincdn/FLrTNDvlna/antv.png',
        'xlink:href':
          '/logo192.png',
        width: 100,
        height: 100,
        x: 12,
        y: 12,
      },
      title: {
        text: '服务器',
        refX: 25,
        refY: 83,
        fill: 'rgba(0,0,0,0.85)',
        fontSize: 12,
        'text-anchor': 'start',
      },
    },
    markup: [
      {
        tagName: 'rect',
        selector: 'body',
      },
      {
        tagName: 'image',
        selector: 'image',
      },
    ],
  },
)