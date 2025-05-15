// src/App.jsx
import { Layout, Typography } from "antd";
import SAMPredictor from "./components/SAMPredictor";
import { Footer } from "antd/es/layout/layout";

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  return (
    <Layout style={{ minHeight: "100vh", background: "#fff" }}>
      <Header
        style={{
          background: "#000",
          padding: "0 50px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Title
          level={2}
          style={{ margin: 0, color: "#fff", textAlign: "center" }}
        >
          SAM Risk Predictor
        </Title>
      </Header>

      <Content
        style={{
          padding: "50px 50px",
          maxWidth: "100vw",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <SAMPredictor />
      </Content>

      <Footer
        style={{
          textAlign: "center",
          background: "#000",
          color: "#fff",
          padding: "20px 0",
        }}
      >
        <Typography.Text style={{ color: "#fff" }}>
          © 2025 SAM Risk Predictor. All rights reserved.
        </Typography.Text>
        <img
          src="logo_san_raf.png"
          alt="Logo"
          style={{ width: "50px", height: "50px", marginLeft: "20px" }}
        />
        <img
          src="logo_fondazione_alfieri.png"
          alt="Logo"
          style={{ width: "50px", height: "50px", marginLeft: "20px" }}
        />
      </Footer>
    </Layout>
  );
}

export default App;
