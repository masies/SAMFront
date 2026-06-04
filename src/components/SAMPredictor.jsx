// src/components/SAMPredictor.jsx
import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Row,
  Col,
  Select,
  Checkbox,
  Alert,
  Progress,
} from "antd";
import "./SAMPredictor.css";

const { Title, Text } = Typography;

const API_URL = import.meta.env.VITE_API_URL || "";

const getRiskProfile = (value) => {
  if (value >= 50) {
    return {
      level: "high",
      title: "High SAM risk",
      color: "#b42318",
      message:
        "Prioritize a focused review of mitral geometry and operative strategy before proceeding.",
    };
  }

  if (value >= 30) {
    return {
      level: "medium",
      title: "Medium SAM risk",
      color: "#b7791f",
      message:
        "Review measurements and surgical plan with attention to modifiable anatomical factors.",
    };
  }

  return {
    level: "low",
    title: "Low SAM risk",
    color: "#067647",
    message:
      "Risk estimate is limited based on the submitted measurements.",
  };
};

const SAMPredictor = () => {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const riskProfile = prediction !== null ? getRiskProfile(prediction) : null;

  const handleValuesChange = (_, allValues) => {
    const a2 = Number(allValues.lunghezza_a2);
    const p2 = Number(allValues.lunghezza_p2);

    if (a2 > 0 && p2 > 0) {
      form.setFieldValue("rapporto_lam_lpm", (a2 / p2).toFixed(2));
    } else {
      form.setFieldValue("rapporto_lam_lpm", undefined);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const payload = {
        ...values,
        rapporto_lam_lpm:
          values.rapporto_lam_lpm ||
          (Number(values.lunghezza_a2) / Number(values.lunghezza_p2)).toFixed(2),
      };

      const response = await fetch(`${API_URL}/api/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(
          data.detail || data.message || data.error || "Prediction failed"
        );
      }

      setPrediction(data.prediction);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card bordered={false} className="predictor-card">
      <div className="predictor-intro">
        <div>
          <Text className="predictor-intro__eyebrow">SAM Risk Calculator</Text>
          <Title level={2} className="predictor-intro__title">
            Patient measurements
          </Title>
        </div>
        <p className="predictor-intro__copy">
          Enter the echocardiographic characteristics to estimate
          systolic anterior motion risk after mitral valve repair.
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onValuesChange={handleValuesChange}
        requiredMark={false}
        className="predictor-form"
      >
          <Row gutter={[16, 4]}>
            <Col xs={24} sm={12} lg={8} xl={6}>
              <Form.Item
                name="Pre_EF"
                label={<Text strong>Left Ventricle Ejection Fraction (%)</Text>}
                rules={[
                  { required: true, message: "Required Field" },
                  {
                    validator: (_, value) =>
                      value >= 40 && value <= 70
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error("Value must be between 40 and 70%")
                          ),
                  },
                ]}
              >
                <Input
                  type="number"
                  size="large"
                  step="1"
                  placeholder="Insert Value"
                />
              </Form.Item>
            </Col>

          <Col xs={24} sm={12} lg={8} xl={6}>
            <Form.Item
              name="lunghezza_a2"
              label={<Text strong>Anterior Leaflet Length (mm)</Text>}
              rules={[
                { required: true, message: "Required Field" },
                {
                  validator: (_, value) =>
                    value >= 14 && value <= 40
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error("Value must be between 14 and 40 mm")
                        ),
                },
              ]}
            >
              <Input
                type="number"
                size="large"
                step="1"
                placeholder="Insert Value"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={8} xl={6}>
            <Form.Item
              name="lunghezza_p2"
              label={<Text strong>Posterior Leaflet Length (mm)</Text>}
              rules={[
                { required: true, message: "Required Field" },
                {
                  validator: (_, value) =>
                    value >= 8 && value <= 35
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error("Value must be between 8 and 35 mm")
                        ),
                },
              ]}
            >
              <Input
                type="number"
                size="large"
                step="1"
                placeholder="Insert Value"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={8} xl={6}>
            <Form.Item
              name="rapporto_lam_lpm"
              label={<Text strong>Leaflet’s Ratio</Text>}
            >
              <Input
                type="number"
                size="large"
                step="0.01"
                disabled
                placeholder="Computed automatically"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={8} xl={6}>
            <Form.Item
              name="distanza_siv_coapt"
              label={<Text strong>C-Sept Distance (mm)</Text>}
              rules={[
                { required: true, message: "Required Field" },
                {
                  validator: (_, value) =>
                    value >= 15 && value <= 50
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error("Value must be between 15 and 50 mm")
                        ),
                },
              ]}
            >
              <Input
                type="number"
                size="large"
                step="1"
                placeholder="Insert Value"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={6}>
            <Form.Item
              name="angolo_ma"
              label={<Text strong>M-A Angle (°)</Text>}
              rules={[
                { required: true, message: "Required Field" },
                {
                  validator: (_, value) => {
                    const num = Number(value);
                    if (isNaN(num) || num < 85 || num > 155) {
                      return Promise.reject("Value outside range (85–155°)");
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

          <Col xs={24} sm={12} lg={8} xl={6}>
            <Form.Item
              name="setto_basale"
              label={<Text strong>Basal Septum (mm)</Text>}
              rules={[
                { required: true, message: "Required Field" },
                {
                  validator: (_, value) =>
                    value >= 8 && value <= 20
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error("Value must be between 8 and 20 mm")
                        ),
                },
              ]}
            >
              <Input
                type="number"
                size="large"
                step="1"
                placeholder="Insert Value"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={8} xl={6}>
            <Form.Item
              name="lv_edd"
              label={
                <Text strong>Left Ventricle End Diastolic Diameter (mm)</Text>
              }
              rules={[
                { required: true, message: "Required Field" },
                {
                  validator: (_, value) =>
                    value >= 35 && value <= 75
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error("Value must be between 35 and 75 mm")
                        ),
                },
              ]}
            >
              <Input
                type="number"
                size="large"
                step="1"
                placeholder="Insert Value"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={8} xl={6}>
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

          <Col xs={24} sm={12} lg={8} xl={6}>
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

          <Col xs={24} sm={12} lg={8} xl={6}>
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

          <Col xs={24} sm={12} lg={8} xl={6}>
            <Form.Item
              name="scallop_involved"
              label="Scallop Involved"
              rules={[
                {
                  validator: (_, value) =>
                    value && value.length > 0
                      ? Promise.resolve()
                      : Promise.reject(new Error("Pick at least one Scallop")),
                },
              ]}
            >
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

          <Col xs={24} sm={8} lg={8} xl={6}>
            <Form.Item name="Any_cleft" valuePropName="checked">
              <Checkbox>Any Cleft</Checkbox>
            </Form.Item>
          </Col>

          <Col xs={24} sm={8} lg={8} xl={6}>
            <Form.Item name="Any_leaflet_calcification" valuePropName="checked">
              <Checkbox>Any Leaflet Calcification</Checkbox>
            </Form.Item>
          </Col>

          <Col xs={24} sm={8} lg={8} xl={6}>
            <Form.Item name="Any_annular_calcification" valuePropName="checked">
              <Checkbox>Any Annular Calcification</Checkbox>
            </Form.Item>
          </Col>
          </Row>

          <Form.Item className="predictor-actions">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              className="predictor-submit"
            >
              Predict SAM Risk
            </Button>
          </Form.Item>
      </Form>

      {error && (
        <Alert
          type="error"
          message="Prediction error"
          description={error}
          showIcon
          className="predictor-alert"
        />
      )}

      {riskProfile && (
        <section
          className={`risk-result risk-result--${riskProfile.level}`}
          aria-live="polite"
        >
          <div className="risk-result__header">
            <div>
              <Text className="risk-result__eyebrow">SAM risk estimate</Text>
              <Title level={3} className="risk-result__title">
                {riskProfile.title}
              </Title>
            </div>
            <div className="risk-result__score">
              {prediction.toFixed(1)}
              <span>%</span>
            </div>
          </div>

          <Progress
            percent={Math.round(prediction)}
            showInfo={false}
            strokeColor={riskProfile.color}
            trailColor="#edf0f2"
            className="risk-result__progress"
          />

          <div className="risk-scale" aria-label="Risk scale">
            {["low", "medium", "high"].map((level) => (
              <div
                key={level}
                className={`risk-scale__item ${
                  riskProfile.level === level ? "risk-scale__item--active" : ""
                }`}
              >
                {level}
              </div>
            ))}
          </div>

          <Text className="risk-result__message">{riskProfile.message}</Text>

          <div className="risk-result__thresholds">
            <span>Low &lt;30%</span>
            <span>Medium 30-49%</span>
            <span>High &gt;=50%</span>
          </div>
        </section>
      )}
    </Card>
  );
};

export default SAMPredictor;
