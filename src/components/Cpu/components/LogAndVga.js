import React, { useState, useEffect } from "react";
import { Row, Col } from 'antd';
import Serial from '../../../resources/sample-serial.txt'
import myvgalog from "../../../resources/vga.txt"

const header = [
  "pc", "instr", "zero", "at",
  "v0", "v1",
  "a0", "a1", "a2", "a3",
  "t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9",
  "s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7",
  "k0", "k1",
  "gp", "sp", "fp", "ra",
]

const printVGALog = (log, cycle, type,setError, header) => {
  let closedDistance = Infinity;
  let closedCycleIndex = 0;
  log.forEach((l, index) => {
    let temp = Math.abs(l.cycle - cycle)
    if (temp < closedDistance) {
      closedDistance = temp
      closedCycleIndex = index
    }
  })

  let res = [
    <tr style={{ borderBottom: "1px solid black" }}>
      <th style={{ width: "30%" }}></th>
      {type === 'cpu' ? <th style={{ width: "70%" }}>noop</th> : null}
      {type === 'simulator' ? <th style={{ width: "70%" }}>nemu</th> : null}
    </tr>
  ]
  let hasErrorflag = false

  let { cpuValue, simulatorValue } = log[closedCycleIndex]
  cpuValue = cpuValue.slice(1, cpuValue.length - 1);
  simulatorValue = simulatorValue.slice(1, simulatorValue.length - 1);

  let cpuValues = cpuValue.split(",");
  let simulatorValues = simulatorValue.split(",");
  cpuValues = cpuValues.map(e => e.trim());
  simulatorValues = simulatorValues.map(e => e.trim());
  const cpuLen = cpuValues.length;
  const simulatorLen = simulatorValues.length;
  const min = cpuLen < simulatorLen ? cpuLen : simulatorLen

  for (let j = 0; j < min; j++) {
    if (cpuValues[j] === simulatorValues[j]) {
      res.push(
        <tr style={{ borderBottom: "1px solid black" }}>
          <th style={{ width: "20%" }}>{header[j]}</th>
          {type === 'cpu' ? <th style={{ width: "40%" }}>{cpuValues[j]}</th> : null}
          {type === 'simulator' ? <th style={{ width: "40%" }}>{simulatorValues[j]}</th> : null}
        </tr>
      )
    } else {
      hasErrorflag = true
      setError({ cycle:log[closedCycleIndex].cycle })
      res.push(
        <tr style={{ borderBottom: "1px solid black", background: 'red' }}>
          <th style={{ width: "20%" }}>{header[j]}</th>
          {type === 'cpu' ? <th style={{ width: "40%" }}>{cpuValues[j]}</th> : null}
          {type === 'simulator' ? <th style={{ width: "40%" }}>{simulatorValues[j]}</th> : null}
        </tr>
      )
    }
  }
  return (
    <table style={{ width: "100%" }}>
      {res}
    </table>
  )
}

const display = (s) => {
  if (s === "\\r") {
    return ''
  } else if (s === "\\n") {
    return (
      <br />
    )
  } else if (s === " ") {
    return <span>&nbsp;</span>
  }
  return s;
}

const printLog = (log, cycle) => {
  let res = []
  for (let i of log) {
    if (i.cycle <= cycle) {
      res.push(
        <span>{display(i.serial)}</span>
      )
    } else {
      break;
    }
  }
  return res
}

export default function LogAndVGA({ program, hasbug, hasDiff, cycle, needInterval }) {
  const [mouseEnterStyle, setMouseEnterStyle] = useState({})
  const [log, setLog] = useState([])
  const [speed, setSpeed] = useState(null)
  const [displayLog, setDisplayLog] = useState(null)
  const [currentCycle, setCurrentCycle] = useState(cycle)
  const [logIntervalInstance, setLogIntervalInstance] = useState(null)

  const [VGALog, setVGALog] = useState('')
  const [displayVGALog, setDisplayVGALog] = useState(null)

  const [error,setError]=useState(null)

  useEffect(() => {
    fetch(`./programs/${program ? program : 'linux'}/${hasbug ? "has" : "no"}_bug_${hasDiff ? "has" : "no"}_diff/nemu_serial.txt`)
      .then(r => r.text())
      .then(text => {
        const logs = text.split('\n');
        const logarray = [];
        for (let i of logs) {
          let cycleStartIndex = i.indexOf('(');
          if (cycleStartIndex > 0) {
            let cycleEndIndex = i.indexOf(',')
            let displayCycle = parseInt(i.slice(cycleStartIndex + 1, cycleEndIndex));
            let serialStartIndex = i.indexOf("'");
            let serialEndIndex = i.lastIndexOf("'");
            let displaySerial = i.slice(serialStartIndex + 1, serialEndIndex);
            logarray.push({ cycle: displayCycle, serial: displaySerial })
          }
        }
        setLog(logarray)
      });

    fetch(`./programs/${program ? program : 'linux'}/${hasbug ? "has" : "no"}_bug_${hasDiff ? "has" : "no"}_diff/registers.txt`)
      .then(r => r.text())
      .then(text => {
        const registers = text.split('\n');
        const registersArray = []
        for (let i of registers) {
          const startIndex = i.indexOf('(');
          const endIndex = i.lastIndexOf(')');
          if (startIndex > -1 && endIndex > -1) {
            const register = i.slice(startIndex + 1, endIndex);
            const first = register.indexOf(",");
            const second = register.indexOf(",", first + 1);
            const right = register.indexOf("]", second + 1);
            const third = register.indexOf(",", right + 1);

            const currentCycle = parseInt(register.slice(0, first).trim());
            const isEqual = Boolean(register.slice(first + 1, second).trim());
            const cpuValue = register.slice(second + 1, third).trim();
            const simulatorValue = register.slice(third + 1).trim();
            registersArray.push({ cycle: currentCycle, isEqual, cpuValue, simulatorValue })
          }
        }
        setVGALog(registersArray)
      });

    fetch(`./programs/${program ? program : 'linux'}/${hasbug ? "has" : "no"}_bug_${hasDiff ? "has" : "no"}_diff/config.json`)
      .then(res => res.json())
      .then(res => {
        setSpeed(res)
      })
  }, [])

  useEffect(() => {
    if (currentCycle >= 0 && log.length > 0) {
      setDisplayLog(printLog(log, parseInt(currentCycle)))
    }
  }, [log, currentCycle])

  useEffect(() => {
    if (displayLog) {
      const d = document.getElementById('logandvgascrolldiv')
      if (d) {
        d.scrollTop = d.scrollHeight;
      }
    }
  }, [displayLog])

  useEffect(() => {
    if (speed) {
      let timer
      if (needInterval) {
        let totalTime = speed.TotalTime
        let interval = speed.Interval
        const { maxCycle, setCycle } = needInterval;
        let step = Math.ceil(maxCycle / Math.ceil((1000 / interval) * totalTime))
        setLogIntervalInstance(setInterval(() => {
          setCurrentCycle(prev => {
            let res = prev + step
            if (res >= maxCycle) {
              res = maxCycle
            }
            return res
          })
        }, interval))

      }

    }
    return () => {
      clearInterval(logIntervalInstance)
    }
  }, [speed])

  useEffect(() => {
    if (needInterval) {
      if (currentCycle === needInterval.maxCycle) {
        clearInterval(logIntervalInstance)
      }
    }
  }, [currentCycle])

  useEffect(() => {
    if (currentCycle >= 0 && VGALog.length > 0) {
      setDisplayVGALog(printVGALog(VGALog, parseInt(currentCycle), 'simulator',setError,
        header.map(value => {
          return "$" + value
        })))
    }
  }, [VGALog, currentCycle])

  useEffect(()=>{
    if(error){
      clearInterval(logIntervalInstance)
      setCurrentCycle(error.cycle)
    }
  },[error])


  return (
    <div
      style={{
        width: '600px',
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
        <Col span={12}>
          <div
            id='logandvgascrolldiv'
            style={{ height: '250px', overflowX: 'scroll', overflowY: 'scroll', backgroundColor: 'black', color: 'white', padding: '5px', borderRadius: '0px 0px 0px 10px' }}>
            {displayLog}
          </div>
        </Col>
        <Col span={12}>
          <div style={{
            width: '100%',
            height: '250px',
            overflow: 'scroll',
            backgroundColor: '#C0C0C0',
            color: 'black',
            borderRadius: '0px 0px 10px 0px',
            padding: '5px',
          }}>
            {displayVGALog}
          </div>
        </Col>
      </Row>

    </div>
  )
}