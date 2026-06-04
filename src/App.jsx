// src/App.jsx
import { Collapse, Layout, Typography } from "antd";
import SAMPredictor from "./components/SAMPredictor";
import "./App.css";

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

function App() {
  return (
    <Layout className="app-shell">
      <Header className="app-header">
        <div className="app-header__inner">
          <span className="app-header__mark" aria-hidden="true">
            SAM
          </span>
          <Title level={2} className="app-header__title">
            SAM Risk Predictor
          </Title>
        </div>
      </Header>

      <Content className="app-content">
        <Collapse
          className="app-info"
          size="small"
          items={[
            {
              key: "about",
              label: "About the SAM Risk Calculator",
              children: (
                <p className="app-info__copy">
                  Introducing the <b>SAM Risk Calculator</b>, an AI-powered tool
                  designed to support clinicians in evaluating patients with
                  primary mitral regurgitation. Developed and validated on a
                  retrospective cohort from the <b>San Raffaele Hospital</b> in
                  Milan, our software harnesses advanced machine learning
                  algorithms trained exclusively on cases of non-rheumatic,
                  non-infective mitral insufficiency without associated septal
                  or aortic valve pathology. By focusing on patients with
                  isolated posterior ring involvement, the SAM Risk Calculator
                  delivers precise, data-driven risk stratification, helping you
                  tailor management strategies and optimize outcomes. Experience
                  fast, evidence-based insights at your fingertips.
                </p>
              ),
            },
          ]}
        />

        <SAMPredictor />
      </Content>

      <Footer className="app-footer">
        <Typography.Text className="app-footer__text">
          © 2025 SAM Risk Predictor. All rights reserved.
        </Typography.Text>
        <div className="app-footer__logos" aria-label="Institutional logos">
          <img
            src="logo_san_raf.png"
            alt="San Raffaele Hospital"
            className="app-footer__logo"
          />
          <img
            src="logo_fondazione_alfieri.png"
            alt="Fondazione Alfieri"
            className="app-footer__logo"
          />
        </div>
      </Footer>
    </Layout>
  );
}

export default App;
