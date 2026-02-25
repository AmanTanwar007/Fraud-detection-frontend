// Global Data
let transactions = [];

// Parse CSV
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',');
    const obj = {};
    headers.forEach((header, index) => {
      obj[header.trim()] = row[index]?.trim() || '';
    });
    data.push(obj);
  }
  return data;
}

// Populate Table
function populateTable(data) {
  const tbody = document.querySelector('#resultsTable tbody');
  tbody.innerHTML = '';

  data.forEach(tx => {
    const row = document.createElement('tr');
    const status = tx.Status || tx.status || 'Safe';

    row.innerHTML = `
      <td>${tx.TransactionID || tx.id}</td>
      <td>${tx.Amount || tx.amount}</td>
      <td class="${status === 'Fraud Detected' ? 'status-fraud' : 'status-safe'}">
        ${status === 'Fraud Detected' ? 'Fraud ⚠️' : 'Safe ✅'}
      </td>
    `;
    tbody.appendChild(row);
  });

  updateStats(data);
  updateChart(data);
}

// Update Stats Cards
function updateStats(data) {
  const total = data.length;
  const fraud = data.filter(tx => tx.Status === 'Fraud Detected' || tx.status === 'Fraud Detected').length;
  const safe = total - fraud;
  const fraudPercent = total ? ((fraud / total) * 100).toFixed(1) : 0;

  document.getElementById('totalTx').textContent = total;
  document.getElementById('totalFraud').textContent = fraud;
  document.getElementById('totalSafe').textContent = safe;
  document.getElementById('fraudPercent').textContent = fraudPercent + '%';
}

// Chart.js Pie Chart
let chart;
function updateChart(data) {
  const fraud = data.filter(tx => tx.Status === 'Fraud Detected' || tx.status === 'Fraud Detected').length;
  const safe = data.length - fraud;

  const ctx = document.getElementById('fraudChart').getContext('2d');
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Safe ✅', 'Fraud ⚠️'],
      datasets: [{
        data: [safe, fraud],
        backgroundColor: ['#4b6cb7', '#ff4d4d'],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

// CSV Upload
document.getElementById('fileInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    transactions = parseCSV(event.target.result);
    populateTable(transactions);
  };
  reader.readAsText(file);
});

// Simulate AI Detection
document.getElementById('detectBtn').addEventListener('click', function() {
  if (!transactions.length) return alert('Upload CSV first!');
  
  // Simple simulation: flag transactions above 5000 as fraud
  transactions = transactions.map(tx => {
    const amount = parseFloat(tx.Amount || tx.amount) || 0;
    return {
      ...tx,
      Status: amount > 5000 ? 'Fraud Detected' : 'Safe'
    };
  });

  populateTable(transactions);
  alert('Detection complete!');
});

// Download Updated CSV
document.getElementById('downloadBtn').addEventListener('click', function() {
  if (!transactions.length) return alert('No data to download!');
  
  const headers = Object.keys(transactions[0]);
  const csvRows = [headers.join(',')];
  transactions.forEach(tx => {
    csvRows.push(headers.map(h => tx[h]).join(','));
  });
  
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'detection_results.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

// Search Table
document.getElementById('searchInput').addEventListener('input', function(e) {
  const value = e.target.value.toLowerCase();
  const filtered = transactions.filter(tx => 
    (tx.TransactionID || tx.id || '').toLowerCase().includes(value)
  );
  populateTable(filtered);
});
