import Terminal from "terminal-in-react"
import './Terminal.css'

export default function CustomTerminal() {

  return (
    <Terminal
      color='white'
      backgroundColor='black'
      barColor='black'
      prompt='white'
      hideTopBar={true}
      allowTabs={false}
      style={{ fontWeight: "bold", fontSize: "1em", maxHeight: '100%' }}

      commands={{
        'open-google': () => window.open('https://www.google.com/', '_blank'),
        showmsg: () => 'Hello World',
        popup: () => alert('Terminal in React')
      }}
      descriptions={{
        'open-google': 'opens google.com',
        showmsg: 'shows a message',
        alert: 'alert', popup: 'alert'
      }}
    />

  )
}