// src/components/SAMPredictor.jsx
import { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography,
  Result,
  Row,
  Col,
} from 'antd';

const { Title, Text } = Typography;

const SAMPredictor = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Watch A2 and P2 values to calculate ratio
  const handleValuesChange = (changedValues, allValues) => {
    const { lunghezza_a2, lunghezza_p2 } = allValues;
    if (lunghezza_a2 && lunghezza_p2 && lunghezza_p2 !== 0) {
      const ratio = (lunghezza_a2 / lunghezza_p2).toFixed(2);
      form.setFieldValue('rapporto_lam_lpm', ratio);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      setPrediction(data.prediction);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formItemStyle = {
    marginBottom: '24px'
  };

  return (
    <Card
      bordered={false}
      style={{
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        borderRadius: '8px'
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onValuesChange={handleValuesChange}
        requiredMark={false}
      >
        <Row gutter={[32, 0]}>
          <Col xs={24} md={8}>
            <Form.Item
              name="dim_anello"
              label={<Text strong>Dimensione Anello</Text>}
              rules={[{ required: true, message: 'Campo richiesto' }]}
              style={formItemStyle}
            >
              <Input type="number" size="large" step="1" placeholder="Inserisci valore" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="lunghezza_a2"
              label={<Text strong>Lunghezza A2 (mm)</Text>}
              rules={[{ required: true, message: 'Campo richiesto' }]}
              style={formItemStyle}
            >
              <Input type="number" size="large" step="1" placeholder="Inserisci valore" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="lunghezza_p2"
              label={<Text strong>Lunghezza P2 (mm)</Text>}
              rules={[{ required: true, message: 'Campo richiesto' }]}
              style={formItemStyle}
            >
              <Input type="number" size="large" step="1" placeholder="Inserisci valore" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="rapporto_lam_lpm"
              label={<Text strong>Rapporto LAM/LPM</Text>}
              style={formItemStyle}
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

          <Col xs={24} md={8}>
            <Form.Item
              name="distanza_siv_coapt"
              label={<Text strong>Distanza SIV-Coapt (mm)</Text>}
              rules={[{ required: true, message: 'Campo richiesto' }]}
              style={formItemStyle}
            >
              <Input type="number" size="large" step="1" placeholder="Inserisci valore" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="angolo_ma"
              label={<Text strong>Angolo M-A (gradi)</Text>}
              rules={[{ required: true, message: 'Campo richiesto' }]}
              style={formItemStyle}
            >
              <Input type="number" size="large" step="1" placeholder="Inserisci valore" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="setto_basale"
              label={<Text strong>Setto Basale (mm)</Text>}
              rules={[{ required: true, message: 'Campo richiesto' }]}
              style={formItemStyle}
            >
              <Input type="number" size="large" step="1" placeholder="Inserisci valore" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="lv_edd"
              label={<Text strong>LV EDD</Text>}
              rules={[{ required: true, message: 'Campo richiesto' }]}
              style={formItemStyle}
            >
              <Input type="number" size="large" step="1" placeholder="Inserisci valore" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginTop: '24px', textAlign: 'center' }}>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            size="large"
            style={{
              backgroundColor: '#000',
              width: '200px',
              height: '45px',
              fontSize: '16px'
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
            <Title level={3} style={{ marginBottom: '8px' }}>
              Risultato Predizione SAM
            </Title>
          }
          subTitle={
            <Text style={{ fontSize: '18px' }}>
              Il rischio previsto è del <Text strong>{prediction.toFixed(1)}%</Text>
            </Text>
          }
          style={{
            marginTop: '24px',
            padding: '24px',
            background: '#fafafa',
            borderRadius: '8px'
          }}
        />
      )}
    </Card>
  );
};

export default SAMPredictor;