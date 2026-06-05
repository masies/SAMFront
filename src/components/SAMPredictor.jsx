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

const getRiskProfile = (value, band) => {
  const normalizedBand = typeof band === "string" ? band.toLowerCase() : "";
  const level =
    normalizedBand.includes("alto") || normalizedBand.includes("high")
      ? "high"
      : normalizedBand.includes("intermedio") ||
          normalizedBand.includes("intermediate") ||
          normalizedBand.includes("medium")
        ? "medium"
        : normalizedBand.includes("basso") || normalizedBand.includes("low")
          ? "low"
          : value >= 32
            ? "high"
            : value >= 11
              ? "medium"
              : "low";

  if (level === "high") {
    return {
      level: "high",
      title: "High SAM risk",
      color: "#b42318",
      message:
        "Prioritize a focused review of mitral geometry and operative strategy before proceeding.",
    };
  }

  if (level === "medium") {
    return {
      level: "medium",
      title: "Intermediate SAM risk",
      color: "#b7791f",
      message:
        "Review measurements and surgical plan with attention to modifiable anatomical factors.",
    };
  }

  return {
    level: "low",
    title: "Low SAM risk",
    color: "#067647",
    message: "Risk estimate is limited based on the submitted measurements.",
  };
};

const optionalRangeRule = (min, max, unit = "") => ({
  validator: (_, value) => {
    if (value === undefined || value === null || value === "") {
      return Promise.resolve();
    }

    const numericValue = Number(value);
    if (Number.isNaN(numericValue) || numericValue < min || numericValue > max) {
      return Promise.reject(
        new Error(`Value must be between ${min} and ${max}${unit}`)
      );
    }

    return Promise.resolve();
  },
});

const yesNoRequiredRule = {
  validator: (_, value) =>
    value === true || value === false
      ? Promise.resolve()
      : Promise.reject(new Error("Required Field")),
};

const formatRingValue = (value) => {
  if (value === undefined || value === null || value === "") {
    return "Not available";
  }

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  return Number.isInteger(numericValue)
    ? numericValue.toString()
    : numericValue.toFixed(1);
};

const formatPercentValue = (value) => {
  if (value === undefined || value === null || value === "") {
    return "Not available";
  }

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  const percentValue = numericValue <= 1 ? numericValue * 100 : numericValue;
  return `${Math.round(percentValue)}%`;
};

const formatRingRange = (range) =>
  Array.isArray(range)
    ? `${range.map((value) => formatRingValue(value)).join("-")} mm`
    : null;

const buildRingPrediction = (data) => {
  const plausibleRange =
    data.predicted_ring_plausible_range ?? data.ring?.plausible_range_mm;
  const predictedMm = data.predicted_ring_mm ?? data.ring?.predicted_mm;
  const recommendedSize =
    data.recommended_ring_size ?? data.ring?.recommended_size;
  const reliability =
    data.ring_prob_within_2mm ?? data.ring?.prob_within_2mm;

  if (!plausibleRange && !predictedMm && !recommendedSize && !reliability) {
    return null;
  }

  return {
    plausibleRange,
    predictedMm,
    recommendedSize,
    reliability,
  };
};

const SAMPredictor = () => {
  const [prediction, setPrediction] = useState(null);
  const [riskBand, setRiskBand] = useState(null);
  const [ringPrediction, setRingPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const riskProfile =
    Number.isFinite(prediction) ? getRiskProfile(prediction, riskBand) : null;

  const handleValuesChange = (changedValues, allValues) => {
    const a2 = Number(allValues["Lunghezza A2_mm"]);
    const p2 = Number(allValues["Lunghezza P2_mm"]);
    const height = Number(allValues.Altezza_cm);
    const weight = Number(allValues.Peso_Kg);

    if (
      Object.prototype.hasOwnProperty.call(changedValues, "Lunghezza A2_mm") ||
      Object.prototype.hasOwnProperty.call(changedValues, "Lunghezza P2_mm")
    ) {
      if (a2 > 0 && p2 > 0) {
        form.setFieldValue("Rapporto LAM/LPM", (a2 / p2).toFixed(2));
      } else {
        form.setFieldValue("Rapporto LAM/LPM", undefined);
      }
    }

    if (
      (Object.prototype.hasOwnProperty.call(changedValues, "Altezza_cm") ||
        Object.prototype.hasOwnProperty.call(changedValues, "Peso_Kg")) &&
      height > 0 &&
      weight > 0
    ) {
      form.setFieldsValue({
        BMI: (weight / (height / 100) ** 2).toFixed(1),
        BSA: Math.sqrt((height * weight) / 3600).toFixed(2),
      });
    } else if (
      Object.prototype.hasOwnProperty.call(changedValues, "Altezza_cm") ||
      Object.prototype.hasOwnProperty.call(changedValues, "Peso_Kg")
    ) {
      form.setFieldsValue({ BMI: undefined, BSA: undefined });
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);
    setPrediction(null);
    setRiskBand(null);
    setRingPrediction(null);

    try {
      const a2 = Number(values["Lunghezza A2_mm"]);
      const p2 = Number(values["Lunghezza P2_mm"]);
      const computedRatio = a2 > 0 && p2 > 0 ? (a2 / p2).toFixed(2) : undefined;
      const payload = {
        ...values,
        "Rapporto LAM/LPM": values["Rapporto LAM/LPM"] || computedRatio,
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

      const samProbability = Number(data.sam_probability ?? data.prediction);
      if (!Number.isFinite(samProbability)) {
        throw new Error("Prediction response missing sam_probability");
      }

      setPrediction(samProbability);
      setRiskBand(data.risk_band);
      setRingPrediction(buildRingPrediction(data));
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
        <section className="predictor-section">
          <Title level={3} className="predictor-section__title">
            Parameters to assess post repair SAM risk:
          </Title>
          <Row gutter={[16, 4]}>
            <Col xs={24} sm={12} lg={8} xl={6}>
              <Form.Item
                name="Pre_EF"
                label={<Text strong>Left Ventricle Ejection Fraction (%)</Text>}
                rules={[
                  { required: true, message: "Required Field" },
                  {
                    validator: (_, value) =>
                      value >= 35 && value <= 88
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error("Value must be between 35 and 88%")
                          ),
                  },
                ]}
              >
                <Input type="number" size="large" step="1" placeholder="Insert Value" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={8} xl={6}>
              <Form.Item
                name="LV EDD"
                label={
                  <Text strong>Left Ventricle End Diastolic Diameter (mm)</Text>
                }
                rules={[
                  { required: true, message: "Required Field" },
                  {
                    validator: (_, value) =>
                      value >= 18 && value <= 88
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error("Value must be between 18 and 88 mm")
                          ),
                  },
                ]}
              >
                <Input type="number" size="large" step="1" placeholder="Insert Value" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={8} xl={6}>
              <Form.Item
                name="Setto basale_mm"
                label={<Text strong>Basal Septum (mm)</Text>}
                rules={[
                  { required: true, message: "Required Field" },
                  {
                    validator: (_, value) =>
                      value >= 0 && value <= 24.4
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error("Value must be between 0 and 24.4 mm")
                          ),
                  },
                ]}
              >
                <Input type="number" size="large" step="1" placeholder="Insert Value" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={8} xl={6}>
              <Form.Item
                name="Distanza SIV-Coapt_mm"
                label={<Text strong>C-Sept Distance (mm)</Text>}
                rules={[
                  { required: true, message: "Required Field" },
                  {
                    validator: (_, value) =>
                      value >= 6 && value <= 51.5
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error("Value must be between 6 and 51.5 mm")
                          ),
                  },
                ]}
              >
                <Input type="number" size="large" step="1" placeholder="Insert Value" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={8} xl={6}>
              <Form.Item
                name="Lunghezza A2_mm"
                label={<Text strong>Anterior Leaflet Length (mm)</Text>}
                rules={[
                  { required: true, message: "Required Field" },
                  {
                    validator: (_, value) =>
                      value >= 3.5 && value <= 49
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error("Value must be between 3.5 and 49 mm")
                          ),
                  },
                ]}
              >
                <Input type="number" size="large" step="1" placeholder="Insert Value" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={8} xl={6}>
              <Form.Item
                name="Lunghezza P2_mm"
                label={<Text strong>Posterior Leaflet Length (mm)</Text>}
                rules={[
                  { required: true, message: "Required Field" },
                  {
                    validator: (_, value) =>
                      value >= 0 && value <= 35
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error("Value must be between 0 and 35 mm")
                          ),
                  },
                ]}
              >
                <Input type="number" size="large" step="1" placeholder="Insert Value" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={8} xl={6}>
              <Form.Item
                name="Rapporto LAM/LPM"
                label={<Text strong>Leaflet Ratio</Text>}
                rules={[
                  { required: true, message: "Required Field" },
                  optionalRangeRule(0, 3.75),
                ]}
              >
                <Input
                  type="number"
                  size="large"
                  step="0.01"
                  placeholder="Computed automatically or insert value"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={8} xl={6}>
              <Form.Item
                name="Angolo M-A_gradi"
                label={<Text strong>M-A Angle (°)</Text>}
                rules={[
                  { required: true, message: "Required Field" },
                  {
                    validator: (_, value) => {
                      const num = Number(value);
                      if (isNaN(num) || num < 65 || num > 170) {
                        return Promise.reject("Value outside range (65-170°)");
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
                label={<Text strong>Scallop Involved</Text>}
                rules={[
                  {
                    validator: (_, value) =>
                      value && value.length > 0
                        ? Promise.resolve()
                        : Promise.reject(new Error("Pick at least one Scallop")),
                  },
                ]}
              >
                <Checkbox.Group className="checkbox-field checkbox-field--grid">
                  {["A1", "A2", "A3", "P1", "P2", "P3"].map((label) => (
                    <Checkbox key={label} value={label}>
                      {label}
                    </Checkbox>
                  ))}
                </Checkbox.Group>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={8} xl={6}>
              <Form.Item
                name="Any cleft"
                label={<Text strong>Any Cleft</Text>}
                rules={[yesNoRequiredRule]}
              >
                <Select size="large" placeholder="Select Yes/No">
                  <Select.Option value={true}>YES</Select.Option>
                  <Select.Option value={false}>NO</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={8} xl={6}>
              <Form.Item
                name="Any calcification leaflet"
                label={<Text strong>Any Leaflet Calcification</Text>}
                rules={[yesNoRequiredRule]}
              >
                <Select size="large" placeholder="Select Yes/No">
                  <Select.Option value={true}>YES</Select.Option>
                  <Select.Option value={false}>NO</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={8} xl={6}>
              <Form.Item
                name="Any calcification anello"
                label={<Text strong>Any Annular Calcification</Text>}
                rules={[yesNoRequiredRule]}
              >
                <Select size="large" placeholder="Select Yes/No">
                  <Select.Option value={true}>YES</Select.Option>
                  <Select.Option value={false}>NO</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </section>

        <section className="predictor-section">
          <Title level={3} className="predictor-section__title">
            Further parameters to assess predicted ring size
          </Title>
          <Row gutter={[16, 4]}>
            <Col xs={24} sm={12} lg={8} xl={6}>
              <Form.Item
                name="Età"
                label={<Text strong>Age (years)</Text>}
                rules={[
                  { required: true, message: "Required Field" },
                  optionalRangeRule(0, 120),
                ]}
              >
                <Input type="number" size="large" step="1" placeholder="Insert Value" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={8} xl={6}>
              <Form.Item
                name="Sesso"
                label={<Text strong>Sex</Text>}
                rules={[{ required: true, message: "Required Field" }]}
              >
                <Select size="large" placeholder="Select Sex">
                  <Select.Option value="M">M</Select.Option>
                  <Select.Option value="F">F</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={8} xl={6}>
              <Form.Item
                name="Altezza_cm"
                label={<Text strong>Height (cm)</Text>}
                rules={[
                  { required: true, message: "Required Field" },
                  optionalRangeRule(126, 217, " cm"),
                ]}
              >
                <Input type="number" size="large" step="1" placeholder="Insert Value" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={8} xl={6}>
              <Form.Item
                name="Peso_Kg"
                label={<Text strong>Weight (kg)</Text>}
                rules={[
                  { required: true, message: "Required Field" },
                  optionalRangeRule(12, 164, " kg"),
                ]}
              >
                <Input type="number" size="large" step="1" placeholder="Insert Value" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={8} xl={6}>
              <Form.Item
                name="BSA"
                label={<Text strong>BSA (m2)</Text>}
                rules={[
                  { required: true, message: "Required Field" },
                  optionalRangeRule(0.85, 2.85, " m2"),
                ]}
              >
                <Input type="number" size="large" step="0.01" placeholder="Insert Value" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={8} xl={6}>
              <Form.Item
                name="BMI"
                label={<Text strong>BMI (kg/m2)</Text>}
                rules={[
                  { required: true, message: "Required Field" },
                  optionalRangeRule(10, 61, " kg/m2"),
                ]}
              >
                <Input type="number" size="large" step="0.1" placeholder="Insert Value" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={8} xl={6}>
              <Form.Item
                name="Pre_LVESV"
                label={<Text strong>Pre LVESV (ml)</Text>}
                rules={[
                  { required: true, message: "Required Field" },
                  optionalRangeRule(0, 160, " ml"),
                ]}
              >
                <Input type="number" size="large" step="1" placeholder="Insert Value" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={8} xl={6}>
              <Form.Item
                name="Mitrale_AP_mm"
                label={<Text strong>Mitral AP distance (mm)</Text>}
                rules={[
                  { required: true, message: "Required Field" },
                  optionalRangeRule(12, 71, " mm"),
                ]}
              >
                <Input type="number" size="large" step="1" placeholder="Insert Value" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={8} xl={6}>
              <Form.Item
                name="mitrale_IC"
                label={<Text strong>Mitral IC distance (mm)</Text>}
                rules={[
                  { required: true, message: "Required Field" },
                  optionalRangeRule(17, 83, " mm"),
                ]}
              >
                <Input type="number" size="large" step="1" placeholder="Insert Value" />
              </Form.Item>
            </Col>
          </Row>
        </section>

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
            {[
              { level: "low", label: "Low", value: "<11%" },
              { level: "medium", label: "Medium", value: "11-31%" },
              { level: "high", label: "High", value: ">=32%" },
            ].map(({ level, label, value }) => (
              <div
                key={level}
                className={`risk-scale__item ${
                  riskProfile.level === level ? "risk-scale__item--active" : ""
                }`}
              >
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <Text className="risk-result__message">{riskProfile.message}</Text>

          {ringPrediction && (
            <div className="ring-beta">
              <div className="ring-beta__content">
                <Text className="ring-beta__eyebrow">Ring sizing beta</Text>
                <Title level={4} className="ring-beta__title">
                  Predicted ring size for this anatomy:{" "}
                  {ringPrediction.recommendedSize !== undefined &&
                  ringPrediction.recommendedSize !== null
                    ? `${formatRingValue(ringPrediction.recommendedSize)} mm`
                    : "Not available"}
                </Title>
                <Text>Model trained on OSR case series</Text>
                <Text className="ring-beta__copy">
                  With a high SAM risk, sizes at the lower end of this range
                   may increase SAM likelihood. Consider upsizing to mitigate risk.
                </Text>
              </div>

              <div className="ring-beta__metrics">
                {(Array.isArray(ringPrediction.plausibleRange) ||
                  ringPrediction.reliability !== undefined) && (
                  <div className="ring-beta__metric ring-beta__metric--combined">
                    <div className="ring-beta__range-stack">
                      <span>Predicted size range</span>
                      <strong>
                        {formatRingRange(ringPrediction.plausibleRange) ??
                          "Not available"}
                      </strong>
                    </div>
                    {ringPrediction.reliability !== undefined &&
                      ringPrediction.reliability !== null && (
                        <small>
                          Model Accuracy within this range:{" "}
                          <strong>
                            {formatPercentValue(ringPrediction.reliability)}
                          </strong>
                        </small>
                      )}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </Card>
  );
};

export default SAMPredictor;
