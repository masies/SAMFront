# SAM Frontend

React + Vite frontend for the SAM risk and ring sizing predictor.

## Input Mapping

### SAM risk inputs

| Payload key | Form label | Type / options |
| --- | --- | --- |
| `Pre_EF` | Left Ventricle Ejection Fraction (%) | Number, 35-88 |
| `LV EDD` | Left Ventricle End Diastolic Diameter (mm) | Number, 18-88 |
| `Setto basale_mm` | Basal Septum (mm) | Number, 0-24.4 |
| `Distanza SIV-Coapt_mm` | C-Sept Distance (mm) | Number, 6-51.5 |
| `Lunghezza A2_mm` | Anterior Leaflet Length (mm) | Number, 3.5-49 |
| `Lunghezza P2_mm` | Posterior Leaflet Length (mm) | Number, 0-35 |
| `Rapporto LAM/LPM` | Leaflet Ratio | Number, 0-3.75; computed from A2 / P2 when possible |
| `Angolo M-A_gradi` | M-A Angle (deg) | Number, 65-170 |
| `Eziologia_MIX_FED` | Etiology | `Myxomatous Disease`, `Fibroelastic Deficiency` |
| `Prolapse` | Type of Lesion | `Prolapse`, `Flail` |
| `Leaflet_involved` | Leaflet Involved | `Posterior`, `Anterior`, `Bileaflet` |
| `scallop_involved` | Scallop Involved | One or more of `A1`, `A2`, `A3`, `P1`, `P2`, `P3` |
| `Any cleft` | Any Cleft | Boolean |
| `Any calcification leaflet` | Any Leaflet Calcification | Boolean |
| `Any calcification anello` | Any Annular Calcification | Boolean |

### Ring sizing inputs

| Payload key | Form label | Type / options |
| --- | --- | --- |
| `Eta` | Age (years) | Number, 0-120 |
| `Sesso` | Sex | `M`, `F` |
| `Altezza_cm` | Height (cm) | Number, 126-217 |
| `Peso_Kg` | Weight (kg) | Number, 12-164 |
| `BSA` | BSA (m2) | Number, 0.85-2.85; computed from height and weight when possible |
| `BMI` | BMI (kg/m2) | Number, 10-61; computed from height and weight when possible |
| `Mitrale_AP_mm` | Mitral AP distance (mm) | Number, 12-71 |
| `mitrale_IC` | Mitral IC distance (mm) | Number, 17-83 |
