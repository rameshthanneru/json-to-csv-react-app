import { useState } from 'react'
import './App.css'

function jsonToCsv(json) {
  // Accepts array of objects or a single object
  if (!Array.isArray(json)) {
    if (typeof json === 'object' && json !== null) {
      json = [json];
    } else {
      return '';
    }
  }
  if (json.length === 0) return '';
  // Collect all unique keys from all objects
  const keys = Array.from(
    json.reduce((set, obj) => {
      Object.keys(obj || {}).forEach(k => set.add(k));
      return set;
    }, new Set())
  );
  const csvRows = [keys.join(',')];
  for (const row of json) {
    csvRows.push(keys.map(k => JSON.stringify(row?.[k] ?? '')).join(','));
  }
  return csvRows.join('\n');
}

function App() {
  const [jsonInput, setJsonInput] = useState('');
  const [csvOutput, setCsvOutput] = useState('');
  const [error, setError] = useState('');

  const handleJsonChange = (e) => {
    setJsonInput(e.target.value);
    setError('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setJsonInput(evt.target.result);
      setError('');
    };
    reader.readAsText(file);
  };

  const handleConvert = () => {
    try {
      let json = JSON.parse(jsonInput);
      // Accept both object and array
      if (!Array.isArray(json) && (typeof json === 'object' && json !== null)) {
        json = [json];
      }
      if (!Array.isArray(json) || json.length === 0 || typeof json[0] !== 'object') {
        setError('Please provide a JSON object or array of objects.');
        setCsvOutput('');
        return;
      }
      const csv = jsonToCsv(json);
      setCsvOutput(csv);
      setError('');
    } catch (e) {
      setError('Invalid JSON data');
      setCsvOutput('');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([csvOutput], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-main-layout">
      <aside className="json2csv-sidebar">
        <h1>JSON to CSV Converter</h1>
        <p className="subtitle">Paste your JSON array or upload a file to convert it to CSV.</p>
        <textarea
          className="json-input"
          rows={10}
          placeholder="Paste JSON array here..."
          value={jsonInput}
          onChange={handleJsonChange}
        />
        <div className="actions">
          <input type="file" accept="application/json" onChange={handleFileUpload} />
          <button onClick={handleConvert}>Convert to CSV</button>
        </div>
        {error && <div className="error">{error}</div>}
        {csvOutput && (
          <div className="csv-output-section">
            <h2>CSV Output</h2>
            <textarea className="csv-output" rows={10} value={csvOutput} readOnly />
            <button onClick={handleDownload}>Download CSV</button>
          </div>
        )}
        <footer className="footer">Made with React + Vite</footer>
      </aside>
      <div className="json2csv-content"></div>
    </div>
  );
}

export default App
