# Test Scripts

## Structure
```
tests/
├── data/               # Test data files
│   ├── notion_sample_full.json
│   └── notion_sample_short.json
├── test_exaone_final.py    # Exaone API test
└── notion_data_extractor.py # Notion data extraction tool
```

## Running Tests

### Exaone API Test
```bash
python tests/test_exaone_final.py
```

### Extract Notion Data
```bash
python tests/notion_data_extractor.py
```

## Environment Variables
Required in `.env`:
- `EXAONE_API_KEY`: API key for Exaone
- `NOTION_TOKEN`: (Optional) Notion integration token