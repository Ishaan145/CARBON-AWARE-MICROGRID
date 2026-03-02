# Model Binaries Directory

## Placeholder Files

This directory contains **placeholder** model files. Replace them with your actual trained models.

### Expected Model Formats

#### DeepAR Model (`deepar_model.pt`)
- **Format**: PyTorch checkpoint (.pt file)
- **Expected structure**:
  ```python
  torch.save({
      'model_state_dict': model.state_dict(),
      'model_config': {...},
      'version': '1.0.0'
  }, 'deepar_model.pt')
  ```

#### LSTM Model (`lstm_model.pt`)
- **Format**: PyTorch checkpoint (.pt file)
- **Expected structure**:
  ```python
  torch.save({
      'model_state_dict': model.state_dict(),
      'model_config': {...},
      'version': '1.0.0'
  }, 'lstm_model.pt')
  ```

#### XGBoost Model (`xgboost_model.pkl` or `.json`)
- **Format**: XGBoost native format
- **Save methods**:
  ```python
  # Method 1: JSON format (recommended)
  model.save_model('xgboost_model.json')
  
  # Method 2: Pickle
  import pickle
  with open('xgboost_model.pkl', 'wb') as f:
      pickle.dump(model, f)
  ```

## How to Replace Placeholders

1. Train your models using the notebooks/scripts provided
2. Export models in the correct format
3. Copy them to this directory
4. Restart the API: `uvicorn api.main:app --reload`

## Model Versioning

The pipeline supports model versioning. Update `config/settings.yaml`:

```yaml
models:
  deepar:
    path: models/binaries/deepar_model_v2.pt
    version: "2.0.0"
```

## Model Requirements

All models must:
- Accept the same feature schema (18 features)
- Output quantile predictions (q10, q50, q90)
- Handle 96-step forecast horizon (24 hours)
- Be compatible with the adapters in `models/adapters/`
