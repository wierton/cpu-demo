import React, { useState, useEffect } from "react";
import { Row, Col } from 'antd';
import Serial from '../../../resources/sample-serial.txt'
import myvgalog from "../../../resources/vga.txt"

const printVGALog = (log, count) => {
  let res = []
  const min = count <= log.length ? count : log.length
  for (let i = 0; i < min; i++) {
    if (i + 1 < min && log[i + 1] === "\n") {
      res.push(
        <>
          <span>{log[i]}</span><br />
        </>
      )
    } else {
      res.push(
        <span>{log[i]}</span>
      )
    }
  }
  return res
}

const printLog = (log, count) => {
  let res = []
  const min = count <= log.length ? count : log.length
  for (let i = 0; i < min; i++) {
    res.push(
      <>
        <span>{log[i]}</span><br />
      </>
    )
  }
  return res
}


export default function LogAndVGA() {
  const [mouseEnterStyle, setMouseEnterStyle] = useState({})
  const [log, setLog] = useState([])
  const [count, setCount] = useState(0)
  const [VGALog, setVGALog] = useState('')
  const [VGACount, setVGACount] = useState(0)

  useEffect(() => {
    fetch(Serial)
      .then(r => r.text())
      .then(text => {
        const logs = text.split('\n')
        setLog(logs)
      });
  }, [])

  useEffect(() => {
    if (log.length > 0) {
      const interval = setInterval(() => {
        setCount(prev => prev + 1)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [log])

  useEffect(() => {
    fetch(myvgalog)
      .then(r => r.text())
      .then(text => {
        setVGALog(text)
      });
  }, [])

  useEffect(() => {
    if (VGALog) {
      const interval = setInterval(() => {
        setVGACount(prev => prev + 1)
      }, 500)
      return () => clearInterval(interval)
    }
  }, [VGALog])

  return (
    <div
      style={{
        width: '500px',
        ...mouseEnterStyle
      }}
      onMouseEnter={() => {
        // console.log('onMouseEnter');
        setMouseEnterStyle({
          // border: '2px solid #03e9f4',
          borderRadius: 12,
          boxShadow: '0 0 50px #03e9f4'
        })
      }}
      onMouseLeave={() => {
        // console.log('onMouseLeave');
        setMouseEnterStyle({})
      }}
    >
      <div style={{
        width: '100%',
        height: '25px',
        backgroundColor: '#F5F5F5',
        borderRadius: '10px 10px 0px 0px',
        color: 'black',
        paddingLeft: '15px',
      }}
      >
        menu
      </div>
      <Row>
        <Col span={10}>
          <div style={{  height: '200px', overflowX: 'scroll', overflowY: 'scroll', backgroundColor: 'black', color: 'white', padding: '5px', borderRadius: '0px 0px 0px 10px' }}>
            {count >= 1 && log.length > 0 ? printLog(log, count) : null}
          </div>
        </Col>
        <Col span={14}>
          <div style={{
            width: '100%',
            height: '200px',
            overflow: 'scroll',
            backgroundColor: '#C0C0C0',
            color: 'black',
            borderRadius: '0px 0px 10px 0px',
            padding: '5px',
          }}>
            {VGACount >= 1 && VGALog ? printVGALog(VGALog, VGACount) : null}
          </div>
        </Col>
      </Row>

    </div>
  )
}