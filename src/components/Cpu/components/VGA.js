import React, { useState, useEffect } from "react";
import { SPEED } from "../../../config/config";

const header = [
  "pc", "instr", "zero", "at",
  "v0", "v1",
  "a0", "a1", "a2", "a3",
  "t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9",
  "s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7",
  "k0", "k1",
  "gp", "sp", "fp", "ra",
]

const getFull=(str)=>{
  let addLen=10-str.length
  let res=str
  if(addLen>0){
    let remainStr=str.substring(2)
    for(let i=0;i<addLen;i++){
      remainStr='0'+remainStr
    }
    res='0x'+remainStr
  }
  return res
}

const printVGALog = (log, cycle, type, changeStyle, removeErrorCircle, setError, header) => {
  // console.log(log)
  let closedDistance = Infinity;
  let closedCycleIndex = 0;
  log.forEach((l, index) => {
    let temp = Math.abs(l.cycle - cycle)
    if (temp < closedDistance) {
      closedDistance = temp
      closedCycleIndex = index
    }
  })
  // console.log(closedCycleIndex)
  let res = [
    <tr style={{ borderBottom: "1px solid black" }}>
      <th style={{ width: "30%" }}></th>
      {type === 'cpu' ? <th style={{ width: "70%" }}>noop</th> : null}
      {type === 'simulator' ? <th style={{ width: "70%" }}>nemu</th> : null}
    </tr>
  ]
  let hasErrorflag = false

  let { cpuValue, simulatorValue, cycle: errorcycle, isEqual } = log[closedCycleIndex]
  cpuValue = cpuValue.slice(1, cpuValue.length - 1);
  simulatorValue = simulatorValue.slice(1, simulatorValue.length - 1);

  let cpuValues = cpuValue?cpuValue.split(","):[];
  let simulatorValues = simulatorValue.split(",");
  cpuValues = cpuValues.map(e => e.trim());
  simulatorValues = simulatorValues.map(e => e.trim());
  const cpuLen = cpuValues.length;
  const simulatorLen = simulatorValues.length;
  // console.log(cpuValues,simulatorValues,min)
  // console.log(isEqual,log[closedCycleIndex])
  if (isEqual) {
    
    if (type === 'cpu') {
      // console.log(type)
      for (let j = 0; j < cpuLen; j++) {
        res.push(
          <tr style={{ borderBottom: "1px solid black" }}>
            <th style={{ width: "30%", fontFamily: "consolas" }}>{header[j]}</th>
            <th style={{ width: "70%", fontFamily: "consolas" }}>{getFull(cpuValues[j])}</th>
          </tr>
        )
      }
    } else if (type === 'simulator') {
      for (let j = 0; j < simulatorLen; j++) {
        res.push(
          <tr style={{ borderBottom: "1px solid black" }}>
            <th style={{ width: "30%", fontFamily: "consolas" }}>{header[j]}</th>
            <th style={{ width: "70%", fontFamily: "consolas" }}>{getFull(simulatorValues[j])}</th>
          </tr>
        )
      }
    }

  } else {
    hasErrorflag = true
    if (type === 'cpu') {
      console.log(cpuLen,cpuValues,cpuValue)
      for (let j = 0; j < cpuLen; j++) {
        if(simulatorLen>j&&cpuValues[j]!==simulatorValues[j]){
          res.push(
            <tr style={{ borderBottom: "1px solid black", background: 'red' }}>
              <th style={{ width: "30%", fontFamily: "consolas" }}>{header[j]}</th>
              <th style={{ width: "70%", fontFamily: "consolas" }}>{getFull(cpuValues[j])}</th>
            </tr>
          )
        }else{
          res.push(
            <tr style={{ borderBottom: "1px solid black" }}>
              <th style={{ width: "30%", fontFamily: "consolas" }}>{header[j]}</th>
              <th style={{ width: "70%", fontFamily: "consolas" }}>{getFull(cpuValues[j])}</th>
            </tr>
          )
        }
        
      }
    } else if (type === 'simulator') {
      for (let j = 0; j < simulatorLen; j++) {
        if(cpuLen>j&&simulatorValues[j]!=cpuValues[j]){
          res.push(
            <tr style={{ borderBottom: "1px solid black", background: 'red' }}>
              <th style={{ width: "30%", fontFamily: "consolas" }}>{header[j]}</th>
              <th style={{ width: "70%", fontFamily: "consolas" }}>{getFull(simulatorValues[j])}</th>
            </tr>
          )
        }else{
          res.push(
            <tr style={{ borderBottom: "1px solid black" }}>
              <th style={{ width: "30%", fontFamily: "consolas" }}>{header[j]}</th>
              <th style={{ width: "70%", fontFamily: "consolas" }}>{getFull(simulatorValues[j])}</th>
            </tr>
          )
        }
        
      }
    }
  }
  if (!hasErrorflag) {
    removeErrorCircle()
  } else {
    // console.log(errorcycle)
    changeStyle()
    setError(prev => {
      if (prev) {
        if (prev.cycle < errorcycle) {
          return prev
        } else {
          return { cycle: errorcycle }
        }
      } else {
        return { cycle: errorcycle }
      }

    })
  }
  // console.log(res)
  // console.log(res)
  return (
    <table style={{ width: "100%" }}>
      {res}
    </table>
  )
}

// const printVGALog = (log, cycle, type, changeStyle, removeErrorCircle) => {
//   let closedDistance = Infinity;
//   let closedCycleIndex = 0;
//   log.forEach((l, index) => {
//     let temp = Math.abs(l.cycle - cycle)
//     if (temp < closedDistance) {
//       closedDistance = temp
//       closedCycleIndex = index
//     }
//   })

//   let res = []
//   let hasErrorflag = false

//   let { cpuValue, simulatorValue } = log[closedCycleIndex]
//   cpuValue = cpuValue.slice(1, cpuValue.length - 1);
//   simulatorValue = simulatorValue.slice(1, simulatorValue.length - 1);

//   let cpuValues = cpuValue.split(",");
//   let simulatorValues = simulatorValue.split(",");
//   cpuValues = cpuValues.map(e => e.trim());
//   simulatorValues = simulatorValues.map(e => e.trim());
//   const cpuLen = cpuValues.length;
//   const simulatorLen = simulatorValues.length;
//   const min = cpuLen < simulatorLen ? cpuLen : simulatorLen
//   if (type === 'cpu') {
//     for (let j = 0; j < min; j++) {
//       if (cpuValues[j] === simulatorValues[j]) {
//         res.push(
//           <>
//             <span>{cpuValues[j]}</span><br />
//           </>
//         )
//       } else {
//         changeStyle()
//         hasErrorflag = true
//         res.push(
//           <>
//             <span style={{ backgroundColor: 'red' }}>{cpuValues[j]}</span><br />
//           </>
//         )
//       }
//     }
//   } else if (type === 'simulator') {
//     for (let j = 0; j < min; j++) {
//       if (cpuValues[j] === simulatorValues[j]) {
//         res.push(
//           <>
//             <span>{simulatorValues[j]}</span><br />
//           </>
//         )
//       } else {
//         hasErrorflag = true
//         res.push(
//           <>
//             <span style={{ backgroundColor: 'red' }}>{simulatorValues[j]}</span><br />
//           </>
//         )
//       }
//     }
//   }

//   if (!hasErrorflag) {
//     removeErrorCircle()
//   }
//   return res
// }

export default function VGA({ program, hasbug, hasDiff, cycle, changeStyle, removeErrorCircle, needInterval }) {
  const [mouseEnterStyle, setMouseEnterStyle] = useState({})
  const [VGALog, setVGALog] = useState([])
  const [currentCycle, setCurrentCycle] = useState(cycle)
  const [speed, setSpeed] = useState(null)
  const [VGAIntervalInstance, setVGAIntervalInstance] = useState(null)
  const [displayVGALog, setDisplayVGALog] = useState(null)

  const [error, setError] = useState(null)

  useEffect(() => {
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
            const isEqual = register.slice(first + 1, second).trim() === 'true' ? true : false;
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
    if (speed) {
      let timer
      if (needInterval) {
        let totalTime = speed.TotalTime
        let interval = speed.Interval
        const { maxCycle } = needInterval;
        let step = Math.ceil(maxCycle / Math.ceil((1000 / interval) * totalTime))
        setVGAIntervalInstance(setInterval(() => {
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
      clearInterval(VGAIntervalInstance)
    }
  }, [speed])

  useEffect(() => {
    if (needInterval) {
      const { setCycle, maxCycle, setIsStart, setAddInterval } = needInterval
      setCycle(currentCycle)
      if (currentCycle === maxCycle) {
        clearInterval(VGAIntervalInstance)
        // setIsStart(false)
        setAddInterval(false)
      }
    }
  }, [currentCycle])

  useEffect(() => {
    if (currentCycle >= 0 && VGALog.length > 0 && !error) {
      setDisplayVGALog(printVGALog(VGALog, parseInt(currentCycle), 'cpu', changeStyle, removeErrorCircle, setError,
        header.map(value => {
          return "$" + value
        })),
      )
    }

  }, [VGALog, currentCycle, error])

  // useEffect(() => {
  //   if (error) {
  //     clearInterval(VGAIntervalInstance)
  //     setCurrentCycle(error.cycle)
  //     if (needInterval) {
  //       const { setIsStart } = needInterval
  //       setIsStart(false)
  //     }
  //   }
  // }, [error])
  // console.log(error)
  return (
    <div
      style={{
        width: '230px',
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
        {displayVGALog}

        {/* <div style={{ width: '20%', boxSizing: 'border-box', float: 'left' }}>
          {header.map(value => {
            return (
              <>
                <span>{"$" + value}</span><br />
              </>
            )
          })}
        </div>
        <div style={{ width: '40%', boxSizing: 'border-box', float: 'left' }}>
          {VGALog.length > 0 ? printVGALog(VGALog, parseInt(currentCycle), 'simulator', changeStyle, removeErrorCircle) : null}
        </div> */}
        {/* <div style={{ width: '100%', boxSizing: 'border-box', float: 'left',textAlign:'center' }}>
          {VGALog.length > 0 ? printVGALog(VGALog, parseInt(currentCycle), 'cpu', changeStyle, removeErrorCircle) : null}
        </div> */}
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
