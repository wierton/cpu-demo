import { Cpu,Terminal } from '../components';
import { Row,Col } from 'antd';

function App() {
  return (
    <Row gutter={{xs: 50}} style={{height:'100%'}}>
      <Col span={24} style={{height:'100%'}}><Cpu/></Col>
      {/* <Col span={8} style={{height:'100%'}}><Terminal/></Col> */}
    </Row>

  );
}

export default App;
