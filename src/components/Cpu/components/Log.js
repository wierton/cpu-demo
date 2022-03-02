import React, { useEffect, useState } from "react";
import { SPEED } from "../../../config/config";

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


export default function Log({ program, hasbug, hasDiff, cycle, needInterval }) {
  const [log, setLog] = useState([])
  const [count, setCount] = useState(0)
  const [mouseEnterStyle, setMouseEnterStyle] = useState({})
  const [displayLog, setDisplayLog] = useState(null)
  const [currentCycle, setCurrentCycle] = useState(cycle)
  const [speed, setSpeed] = useState(null)
  const [intervalInstance, setIntervalInstance] = useState(null)

  useEffect(() => {
    fetch(`./programs/${program ? program : 'linux'}/${hasbug ? "has" : "no"}_bug_${hasDiff ? "has" : "no"}_diff/noop_serial.txt`)
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

    fetch(`./programs/${program ? program : 'linux'}/${hasbug ? "has" : "no"}_bug_${hasDiff ? "has" : "no"}_diff/config.json`)
      .then(res => res.json())
      .then(res => {
        setSpeed(res)
      })
  }, [])

  useEffect(() => {
    if (speed) {
      let timer
      if (needInterval) {
        let totalTime = speed.TotalTime
        let interval = speed.Interval
        const { maxCycle, setCycle } = needInterval;
        let step = Math.ceil(maxCycle / Math.ceil((1000 / interval) * totalTime))
        setIntervalInstance(setInterval(() => {
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
      clearInterval(intervalInstance)
    }
  }, [speed])

  useEffect(() => {
    if (needInterval) {
      if (currentCycle === needInterval.maxCycle) {
        clearInterval(intervalInstance)
      }
    }
  }, [currentCycle])

  // useEffect(() => {
  //   if (needInterval) {
  //     const { setCycle } = needInterval
  //     setCycle(currentCycle)
  //   }
  // }, [currentCycle])
  useEffect(() => {
    if (currentCycle >= 0 && log.length > 0) {
      setDisplayLog(printLog(log, parseInt(currentCycle)))
    }
  }, [log, currentCycle])

  useEffect(() => {
    if (displayLog) {
      const d = document.getElementById('scrolldiv')
      if (d) {
        d.scrollTop = d.scrollHeight;
      }
    }
  }, [displayLog])
  // useEffect(() => {
  //   if (log.length > 0) {
  //     const interval = setInterval(() => {
  //       setCount(prev => prev + 1)
  //     }, 2000)
  //     return () => clearInterval(interval)
  //   }
  // }, [log])

  return (
    <div
      style={{
        width: '300px',
        ...mouseEnterStyle
      }}
      onMouseEnter={() => {
        setMouseEnterStyle({
          borderRadius: 12,
          boxShadow: '0 0 50px #03e9f4'
        })
      }}
      onMouseLeave={() => {
        setMouseEnterStyle({})
      }}
    >
      <div style={{ width: '300px', height: '25px', backgroundColor: '#AAAAAA', borderRadius: '10px 10px 0px 0px', color: 'white', paddingLeft: '15px' }}>menu</div>
      <div
        id="scrolldiv"
        style={{ width: '300px', height: '300px', overflow: 'auto', backgroundColor: 'black', color: 'white', padding: '5px', borderRadius: '0px 0px 10px 10px' }}
      >
        {/* {count >= 1 && log.length > 0 ? printLog(log, count) : null} */}
        {displayLog}
      </div>
    </div>
  )
}

// import Serial from '../../../resources/sample-serial.txt'
// const printLog = (log, count) => {
//   let res = []
//   const min = count <= log.length ? count : log.length
//   for (let i = 0; i < min; i++) {
//     res.push(
//       <>
//         <span>{log[i]}</span><br />
//       </>
//     )
//   }
//   return res
// }


// export default function Log() {
//   const [log, setLog] = useState([])
//   const [count, setCount] = useState(0)
//   const [mouseEnterStyle, setMouseEnterStyle] = useState({})
//   useEffect(() => {
//     fetch(Serial)
//       .then(r => r.text())
//       .then(text => {
//         const logs = text.split('\n')
//         setLog(logs)
//       });
//   }, [])

//   useEffect(() => {
//     if (log.length > 0) {
//       const interval = setInterval(() => {
//         setCount(prev => prev + 1)
//       }, 2000)
//       return () => clearInterval(interval)
//     }
//   }, [log])

//   return (
//     <div
//       style={{
//         width: '300px',
//         ...mouseEnterStyle
//       }}
//       onMouseEnter={() => {
//         setMouseEnterStyle({
//           borderRadius: 12,
//           boxShadow: '0 0 50px #03e9f4'
//         })
//       }}
//       onMouseLeave={() => {
//         setMouseEnterStyle({})
//       }}
//     >
//       <div style={{ width: '300px', height: '25px', backgroundColor: '#AAAAAA', borderRadius: '10px 10px 0px 0px', color: 'white', paddingLeft: '15px' }}>menu</div>
//       <div style={{ width: '300px', height: '300px', overflowX: 'scroll', overflowY: 'scroll', backgroundColor: 'black', color: 'white', padding: '5px', borderRadius: '0px 0px 10px 10px' }}>
//         {count >= 1 && log.length > 0 ? printLog(log, count) : null}
//       </div>
//     </div>
//   )
// }