// src/App.jsx
import { Layout, Typography } from 'antd';
import SAMPredictor from './components/SAMPredictor';

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Header style={{ 
        background: '#000', 
        padding: '0 50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Title level={2} style={{ margin: 0, color: '#fff', textAlign: 'center' }}>
          SAM Risk Predictor
        </Title>
      </Header>

      <Content style={{ padding: '50px 50px', maxWidth: '100vw', margin: '0 auto', width: '100%' }}>
        <SAMPredictor />
      </Content>
    </Layout>
  );
}

export default App;