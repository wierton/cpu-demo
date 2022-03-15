import React, { useEffect, useState } from "react"
import { Tooltip, Button } from 'antd'
import {
  CloseOutlined,
} from '@ant-design/icons';
import Signal from '../../../resources/sample-signals.txt'
import IFUCode from '../../../resources/core/ifu.scala'
import CP0Code from '../../../resources/core/cp0.scala'
import EXUCode from '../../../resources/core/exu.scala'
import IDUCode from '../../../resources/core/idu.scala'
import ISUCode from '../../../resources/core/isu.scala'
import BRUCode from '../../../resources/core/bru.scala'
import LSUCode from '../../../resources/core/lsu.scala'
import TLBCode from '../../../resources/core/tlb.scala'

const reactStringReplace = require('react-string-replace')

var _ = require('lodash')

const mapper = {
  'IFU': IFUCode,
  'IDU': IDUCode,
  'ISU': ISUCode,
  'EXU': EXUCode,
  'BRU': BRUCode,
  'LSU': LSUCode,
  'TLB': TLBCode,
  'CP0': CP0Code,
}

const traverse = (jsonData, prefix = '') => {
  let res = {}
  for (let key in jsonData) {
    const value = jsonData[key]
    if (!_.isArray(value) && _.isObject(value)) {
      const child = traverse(jsonData[key], `${prefix}${key}.`)
      res = { ...res, ...child }
    } else {
      res[`${prefix}${key}`] = value
    }
  }
  return res
}

const decorateCodeMapper = {
  "class\u00a0": 'yellow',
  "abstract\u00a0": 'red',
  "{": "blue",
  "}": "blue",
  "val\u00a0": "green",
  "import": "maroon",
  "package": "olive",
  "\u00a0=\u00a0": "yellow",
  ":=": "bisque",
  "->": "red",
  "(": "cornflowerblue",
  ")": "cornflowerblue",
  "when": "orange",
}

const getUTF8Char=(count)=>{
  let res=""
  for(let i=0;i<count;i++){
    res+='\u00a0'
  }
  return res
}

const decorateCode = (str) => {
  let replacedText = str;
  for (let key in decorateCodeMapper) {
    replacedText = reactStringReplace(replacedText,
      key, (match, i) => (
        <span style={{ color: decorateCodeMapper[key] }}>{match}</span>
      ));
  }
  return replacedText
}

export default function Code({
  id,
  cycle,
  program,
  hasbug,
  hasDiff,
}) {
  const [rows, setRows] = useState([])
  const [variableStatus, setVariableStatus] = useState(null)
  const [mouseEnterStyle, setMouseEnterStyle] = useState({})
  const [errors, setErrors] = useState([])
  useEffect(() => {
    // console.log(id, ' ', cycle)
    if (mapper.hasOwnProperty(id)) {
      fetch(mapper[id])
        .then(r => r.text())
        .then(text => {
          const codes = text.split('\n')
          setRows(codes)
        });

      fetch(`./programs/${program ? program : 'linux'}/${hasbug ? "has" : "no"}_bug_${hasDiff ? "has" : "no"}_diff/config.json`)
        .then(res => res.json())
        .then(res => {
          const { error } = res
          if (error) {
            setErrors(error[id])
          }
        })
    }

    fetch(`./programs/${program ? program : 'linux'}/${hasbug ? "has" : "no"}_bug_${hasDiff ? "has" : "no"}_diff/noop-signals.txt`)
      .then(r => r.text())
      .then(text => {
        const signals = text.split('\n')
        let cycleNum = parseInt(cycle)
        // let closedIndex=findClosed(signals,cycleNum)
        let closedIndex = -1
        let closedDis = Infinity
        // console.log(signals)
        signals.forEach((signal, index) => {
          // console.log(signal,index)
          const first = signal.indexOf(':')
          const second = signal.indexOf(':', first + 1)
          let head = signal.substring(first + 1, second).replace(/\s+/g, "")
          if (head === id) {
            // console.log(head)
            let currentCycle = parseInt(signal.substring(0, first).replace(/[^0-9]/ig, ""))
            if (Math.abs(currentCycle - cycleNum) < closedDis) {
              closedDis = Math.abs(currentCycle - cycleNum)
              closedIndex = index
            }
          }
        })
        // console.log(program,hasbug,hasDiff)
        // console.log(`./programs/${program ? program : 'linux'}/${hasbug ? "has" : "no"}_bug_${hasDiff ? "has" : "no"}_diff/noop-signals.txt`)
        // console.log(cycleNum, closedIndex)
        if (closedIndex >= 0) {

          let sig = signals[closedIndex]
          // console.log(sig)
          const first = sig.indexOf(':')
          const second = sig.indexOf(':', first + 1)
          let jsonData = sig.substring(second + 1)
          // console.log(currentCycle, head, JSON.parse(jsonData))
          const status = traverse(JSON.parse(jsonData))
          // console.log(status)
          setVariableStatus(status)

        }
      })
  }, [])
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
        backgroundColor: '#AAAAAA',
        borderRadius: '10px 10px 0px 0px',
        color: 'white',
        paddingLeft: '15px',
      }}
      >
      </div>
      <div style={{
        width: '100%',
        height: '500px',
        overflow: 'scroll',
        backgroundColor: 'black',
        color: 'white',
        borderRadius: '0px 0px 10px 10px',
        fontFamily: "Consolas, 'Courier New', monospace"
      }}>
        {variableStatus && rows ? rows.map((row, index) => {
          let spaceCount = 0;
          for (let s of row) {
            if (s === " ") {
              spaceCount++;
            } else {
              break;
            }
          }
          let replacedText = decorateCode(row.substring(spaceCount).replace(/ /ig,'\u00a0'));
          let tooltips = []
          for (let s in variableStatus) {
            if (row.includes(s)) {
              tooltips.push(`${s} = ${variableStatus[s]}`)
            }
          }
          // console.log(tooltips)
          if (tooltips.length === 0) {
            return (
              <p
                style={{ marginBottom: '1px' }}
              >
                &nbsp;&nbsp;
                {getUTF8Char(spaceCount)}
                <span
                  style={{
                    textDecoration: errors.includes(index) ? 'red wavy underline' : 'none'
                  }}>
                  {replacedText}
                </span>
                &nbsp;&nbsp;
              </p>
            )
          } else {
            return (
              <p
                style={{ marginBottom: '1px' }}
              >
                <Tooltip title={tooltips.map(t => {
                  return (
                    <>
                      <span>{t}</span><br />
                    </>
                  )
                })}
                  color='cyan'
                  mouseEnterDelay={0}
                  mouseLeaveDelay={0}
                  destroyTooltipOnHide={true}
                >
                  &nbsp;&nbsp;
                  {getUTF8Char(spaceCount)}
                  <span
                    style={{
                      textDecoration: errors.includes(index) ? 'red wavy underline' : 'none'
                    }}>
                    {replacedText}
                  </span>
                  &nbsp;&nbsp;
                </Tooltip>
              </p>
            )
          }
        }) : rows.map((row, index) => {
          let spaceCount = 0;
          for (let s of row) {
            if (s === " ") {
              spaceCount++;
            } else {
              break;
            }
          }
          let replacedText = decorateCode(row.substring(spaceCount).replace(/ /ig,'\u00a0'));
          return (
            <p
              style={{ marginBottom: '1px' }}
            >
              &nbsp;&nbsp;
              {getUTF8Char(spaceCount)}
              <span
                style={{
                  textDecoration: errors.includes(index) ? 'red wavy underline' : 'none'
                }}>
                {replacedText}
              </span>
              &nbsp;&nbsp;
            </p>
          )
        })}
      </div>
    </div>
  )
}
