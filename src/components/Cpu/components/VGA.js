import React, { useState, useEffect } from "react";
import { SPEED } from "../../../config/config";

const printVGALog = (log, cycle, type, changeStyle, removeErrorCircle) => {
  let closedDistance = Infinity;
  let closedCycleIndex = 0;
  log.forEach((l, index) => {
    let temp = Math.abs(l.cycle - cycle)
    if (temp < closedDistance) {
      closedDistance = temp
      closedCycleIndex = index
    }
  })

  let res = []
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
  if (type === 'cpu') {
    for (let j = 0; j < min; j++) {
      if (cpuValues[j] === simulatorValues[j]) {
        res.push(
          <>
            <span>{cpuValues[j]}</span><br />
          </>
        )
      } else {
        changeStyle()
        hasErrorflag = true
        res.push(
          <>
            <span style={{ backgroundColor: 'red' }}>{cpuValues[j]}</span><br />
          </>
        )
      }
    }
  } else if (type === 'simulator') {
    for (let j = 0; j < min; j++) {
      if (cpuValues[j] === simulatorValues[j]) {
        res.push(
          <>
            <span>{simulatorValues[j]}</span><br />
          </>
        )
      } else {
        hasErrorflag = true
        res.push(
          <>
            <span style={{ backgroundColor: 'red' }}>{simulatorValues[j]}</span><br />
          </>
        )
      }
    }
  }

  if (!hasErrorflag) {
    removeErrorCircle()
  }
  return res
}
export default function VGA({ program, hasbug, cycle, changeStyle, removeErrorCircle,needInterval }) {
  const [mouseEnterStyle, setMouseEnterStyle] = useState({})
  const [VGALog, setVGALog] = useState([])
  const [currentCycle,setCurrentCycle]=useState(cycle)
  const [displayLog,setDisplayLog]=useState(null)

  useEffect(() => {
    fetch(`./programs/${program ? program : 'linux'}/${hasbug ? 'with_bug' : 'without_bug'}/registers.txt`)
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
  }, [])

  useEffect(() => {
    let timer
    if (needInterval) {
      let totalTime = SPEED.TotalTime
      let interval = SPEED.Interval
      const { maxCycle, setCycle,setIsStart } = needInterval;
      let step = Math.ceil(maxCycle / Math.ceil((1000 / interval) * 10))
      timer = setInterval(() => {
        setCurrentCycle(prev => {
          let res = prev + step
          if (res >= maxCycle) {
            res = maxCycle
            clearInterval(timer)
            setIsStart(false)
          }
          return res
        })
      }, interval)

    }
  }, [])

  useEffect(() => {
    if (needInterval) {
      const { setCycle } = needInterval
      setCycle(currentCycle)
    }
  }, [currentCycle])


  return (
    <div
      style={{
        width: '300px',
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
      <div style={{
        width: '100%',
        height: '200px',
        overflow: 'scroll',
        backgroundColor: '#C0C0C0',
        color: 'black',
        borderRadius: '0px 0px 10px 10px',
        padding: '5px',
      }}>
        <div style={{ width: '50%', boxSizing: 'border-box', float: 'left' }}>
          {VGALog.length > 0 ? printVGALog(VGALog, parseInt(currentCycle), 'cpu', changeStyle, removeErrorCircle) : null}
        </div>
        <div style={{ width: '50%', boxSizing: 'border-box', float: 'left' }}>
          {VGALog.length > 0 ? printVGALog(VGALog, parseInt(currentCycle), 'simulator', changeStyle, removeErrorCircle) : null}
        </div>
        {/* {VGALog.length>0?printVGALog(VGALog,parseInt(cycle)):null} */}
      </div>
    </div>
  )
}

// import React, { useState, useEffect } from "react";
// import myvgalog from "../../../resources/vga.txt"
// const printVGALog = (log, count) => {
//   let res = []
//   const min = count <= log.length ? count : log.length
//   for (let i = 0; i < min; i++) {
//     if (i + 1 < min && log[i + 1] === "\n") {
//       res.push(
//         <>
//           <span>{log[i]}</span><br />
//         </>
//       )
//     } else {
//       res.push(
//         <span>{log[i]}</span>
//       )
//     }
//   }
//   return res
// }
// export default function VGA() {
//   const [mouseEnterStyle, setMouseEnterStyle] = useState({})
//   const [VGALog, setVGALog] = useState('')
//   const [VGACount, setVGACount] = useState(0)
//   useEffect(() => {
//     fetch(myvgalog)
//       .then(r => r.text())
//       .then(text => {
//         setVGALog(text)
//       });
//   }, [])

//   useEffect(() => {
//     if (VGALog) {
//       const interval = setInterval(() => {
//         setVGACount(prev => prev + 1)
//       }, 500)
//       return () => clearInterval(interval)
//     }
//   }, [VGALog])
//   return (
//     <div
//       style={{
//         width: '300px',
//         ...mouseEnterStyle
//       }}
//       onMouseEnter={() => {
//         // console.log('onMouseEnter');
//         setMouseEnterStyle({
//           // border: '2px solid #03e9f4',
//           borderRadius: 12,
//           boxShadow: '0 0 50px #03e9f4'
//         })
//       }}
//       onMouseLeave={() => {
//         // console.log('onMouseLeave');
//         setMouseEnterStyle({})
//       }}
//     >
//       <div style={{
//         width: '100%',
//         height: '25px',
//         backgroundColor: '#F5F5F5',
//         borderRadius: '10px 10px 0px 0px',
//         color: 'black',
//         paddingLeft: '15px',
//       }}
//       >
//         menu
//       </div>
//       <div style={{
//         width: '100%',
//         height: '200px',
//         overflow: 'scroll',
//         backgroundColor: '#C0C0C0',
//         color: 'black',
//         borderRadius: '0px 0px 10px 10px',
//         padding: '5px',
//       }}>
//         {VGACount >= 1 && VGALog ? printVGALog(VGALog, VGACount) : null}
//       </div>
//     </div>
//   )
// }