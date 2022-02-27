import React, { useState } from "react"
import background from '../../../images/background.png'
export default function BackGroundImage() {
  const [mouseEnterStyle, setMouseEnterStyle] = useState({})
  return (
    <img
      style={{
        width: '500px',
        transform: 'rotateY(40deg) skewY(-20deg)',
        ...mouseEnterStyle
      }}
      src={background}
      alt="background"
      onMouseEnter={() => {
        setMouseEnterStyle({
          boxShadow: '0 0 50px #03e9f4'
        })
      }}
      onMouseLeave={() => {
        setMouseEnterStyle({})
      }}
    />
  )
}