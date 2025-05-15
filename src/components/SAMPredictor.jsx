// src/components/SAMPredictor.jsx
import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Result,
  Row,
  Col,
  Select,
  Checkbox,
} from "antd";
import "./SAMPredictor.css";

const { Title, Text } = Typography;

const API_URL = import.meta.env.VITE_API_URL || "http://0.0.0.0:5001";

const SAMPredictor = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Watch A2 and P2 values to calculate ratio
  const handleValuesChange = (changedValues, allValues) => {
    const { A2_mm, P2_mm } = allValues;
    if (A2_mm && P2_mm && P2_mm !== 0) {
      const ratio = (A2_mm / P2_mm).toFixed(2);
      form.setFieldValue("ratio_lam_lpm", ratio);
    }
  };

  const onFinish = async (values) => {
    console.log("Form values:", values);
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      setPrediction(data.prediction);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      bordered={false}
      style={{
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        borderRadius: "8px",
      }}
    >
      <Row style={{ paddingBottom: "30px" }}>
        <Col span={24}>
          <div>
            Introducing the <b>SAM Risk Calculator</b>, an AI-powered tool
            designed to{" "}
            <b>
              support clinicians in evaluating patients with primary mitral
              regurgitation
            </b>
            . Developed and validated on a retrospective cohort from the{" "}
            <b>San Raffaele Hospital </b> in Milan, our software harnesses
            advanced machine learning algorithms trained exclusively on cases of
            non-rheumatic, non-infective mitral insufficiency without associated
            septal or aortic valve pathology. By focusing on patients with
            isolated posterior ring involvement, the SAM Risk Calculator
            delivers precise, data-driven risk stratification, helping you
            tailor management strategies and optimize outcomes. Experience fast,
            evidence-based insights at your fingertips.
          </div>
        </Col>
      </Row>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onValuesChange={handleValuesChange}
        requiredMark={false}
      >
        <Row gutter={[32, 0]}>
          <Col xs={24} md={6}>
            <Form.Item
              name="Pre_EF"
              label={<Text strong>Left Ventricle Ejection Fraction (%)</Text>}
              rules={[{ required: true, message: "Required Field" }]}
            >
              <Input
                type="number"
                size="large"
                step="1"
                placeholder="Insert Value"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item
              name="A2_mm"
              label={<Text strong>Anterior Leaflet Length (mm)</Text>}
              rules={[{ required: true, message: "Required Field" }]}
            >
              <Input
                type="number"
                size="large"
                step="1"
                placeholder="Insert Value"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item
              name="P2_mm"
              label={<Text strong>Posterior Leaflet Length (mm)</Text>}
              rules={[{ required: true, message: "Required Field" }]}
            >
              <Input
                type="number"
                size="large"
                step="1"
                placeholder="Insert Value"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item
              name="ratio_lam_lpm"
              label={<Text strong>Leaflet’s RATIO”</Text>}
            >
              <Input
                type="number"
                size="large"
                step="0.01"
                disabled
                placeholder="Calcolato automaticamente"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item
              name="SIV-Coapt_mm"
              label={<Text strong>C-Sept Distance (mm)</Text>}
              rules={[{ required: true, message: "Required Field" }]}
            >
              <Input
                type="number"
                size="large"
                step="1"
                placeholder="Insert Value"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              name="angolo_ma"
              label={<Text strong>M-A Angle (°)</Text>}
              rules={[
                { required: true, message: "Required Field" },
                {
                  validator: (_, value) => {
                    const num = Number(value);
                    if (isNaN(num) || num < 0 || num > 360) {
                      return Promise.reject("Value outside range (0–360°)");
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                type="number"
                size="large"
                step="1"
                placeholder="Insert Value"
                addonAfter="°"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item
              name="setto_basale"
              label={<Text strong>Basal Septum (mm)</Text>}
              rules={[{ required: true, message: "Required Field" }]}
            >
              <Input
                type="number"
                size="large"
                step="1"
                placeholder="Insert Value"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item
              name="lv_edd"
              label={
                <Text strong>Left Ventricle End Diastolic Diameter (mm)</Text>
              }
              rules={[{ required: true, message: "Required Field" }]}
            >
              <Input
                type="number"
                size="large"
                step="1"
                placeholder="Insert Value"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item
              name="Eziologia_MIX_FED"
              label={<Text strong>Etiology</Text>}
              rules={[{ required: true, message: "Required Field" }]}
            >
              <Select size="large" placeholder="Select Etiology">
                <Select.Option value="Myxomatous Disease">
                  Myxomatous Disease
                </Select.Option>
                <Select.Option value="Fibroelastic Deficiency">
                  Fibroelastic Deficiency
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item
              name="Prolapse"
              label={<Text strong>Type of Lesion</Text>}
              rules={[{ required: true, message: "Required Field" }]}
            >
              <Select size="large" placeholder="Select Lesion Type">
                <Select.Option value="Prolapse">Prolapse</Select.Option>
                <Select.Option value="Flail">Flail</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item
              name="Leaflet_involved"
              label={<Text strong>Leaflet Involved</Text>}
              rules={[{ required: true, message: "Required Field" }]}
            >
              <Select size="large" placeholder="Select Leaflet">
                <Select.Option value="Posterior">Posterior</Select.Option>
                <Select.Option value="Anterior">Anterior</Select.Option>
                <Select.Option value="Bileaflet">Bileaflet</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item name="scallop_involved" label="Scallop Involved">
              <Checkbox.Group>
                <Row gutter={[8, 8]}>
                  {["A1", "A2", "A3", "P1", "P2", "P3"].map((label) => (
                    <Col key={label} span={8}>
                      <Checkbox value={label}>{label}</Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item name="Any_cleft" valuePropName="checked">
              <Checkbox>Any Cleft</Checkbox>
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item name="Any_leaflet_calcification" valuePropName="checked">
              <Checkbox>Any Leaflet Calcification</Checkbox>
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item name="Any_annular_calcification" valuePropName="checked">
              <Checkbox>Any Annular Calcification</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginTop: "24px", textAlign: "center" }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            style={{
              backgroundColor: "#000",
              width: "200px",
              height: "45px",
              fontSize: "16px",
            }}
          >
            Calcola Rischio
          </Button>
        </Form.Item>
      </Form>

      {prediction !== null && (
        <Result
          status={prediction > 50 ? "warning" : "success"}
          title={
            <div>
              <img
                className="spinning-image"
                src="/azz.png"
                alt="Loading"
                style={{ scale: "140%", padding: "10px" }}
              />
              <Title level={3} style={{ marginBottom: "8px" }}>
                Risultato Predizione SAM
              </Title>
            </div>
          }
          subTitle={
            <Text style={{ fontSize: "18px" }}>
              Il rischio previsto è del{" "}
              <Text strong>{prediction.toFixed(1)}%</Text>
            </Text>
          }
          style={{
            marginTop: "24px",
            padding: "24px",
            background: "#fafafa",
            borderRadius: "8px",
          }}
        />
      )}
    </Card>
  );
};

export default SAMPredictor;
