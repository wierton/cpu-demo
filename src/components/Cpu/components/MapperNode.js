import React from "react"

export default function MapperNode({ width, height }) {
  return (
    <div
      style={{
        backgroundColor: 'transparent',
        width,
        height,
        transform: 'rotateY(40deg) skewY(-20deg)',
        borderStyle: 'solid',
        borderWidth: '1px',
        borderColor: 'red',
      }}
    />
  )
}
