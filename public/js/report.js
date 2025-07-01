

  // ✅ Replace with your Firebase config
  const firebaseConfig = {
    apiKey: "AIzaSyD9h0g0YOKvq7_6HpD9ftGyH0bXfxXNLIk",
    authDomain: "parkingapp-47d6d.firebaseapp.com",
    projectId: "parkingapp-47d6d",
    storageBucket: "parkingapp-47d6d.appspot.com",
    messagingSenderId: "77735745622",
    appId: "1:77735745622:web:37682bcfabdcfd2f47c3f7",
    measurementId: "G-FH3WFGN2Q5"
  };

  // ✅ Init Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  // ✅ Load and display reports in table
  async function fetchReports() {
    const tableBody = document.querySelector("#reportTable tbody");
    tableBody.innerHTML = ''; // Clear table

    const snapshot = await db.collection("Reports").orderBy("timestamp", "desc").get();

    snapshot.forEach(doc => {
      const data = doc.data();
      const row = document.createElement("tr");

      const date = new Date(data.timestamp.seconds * 1000).toLocaleString();
      const user = data.userId || 'N/A';
      const topic = data.topic || 'N/A';
      const description = data.description || 'N/A';

      row.innerHTML = `
        <td>${date}</td>
        <td>${user}</td>
        <td>${topic}</td>
        <td>${description}</td>
      `;
      tableBody.appendChild(row);
    });
  }

  // ✅ Filter by date
  function filterReport() {
    const from = new Date(document.getElementById('fromDate').value);
    const to = new Date(document.getElementById('toDate').value);
    if (!from || !to) return;

    const rows = document.querySelectorAll("#reportTable tbody tr");
    rows.forEach(row => {
      const rowDate = new Date(row.cells[0].innerText);
      if (rowDate < from || rowDate > to) {
        row.style.display = "none";
      } else {
        row.style.display = "";
      }
    });
  }

  // ✅ Export CSV
  function exportCSV() {
    let csv = [];
    const rows = document.querySelectorAll("table tr");
    for (let row of rows) {
      const cols = Array.from(row.querySelectorAll("th, td")).map(col => `"${col.innerText}"`);
      csv.push(cols.join(","));
    }

    const csvContent = "data:text/csv;charset=utf-8," + csv.join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ✅ Show real-time unread report count
  function listenNewReports() {
    db.collection("Reports").where("isRead", "==", false)
      .onSnapshot(snapshot => {
        const count = snapshot.size;
        const badge = document.getElementById("new-report-count");

        if (count > 0) {
          badge.style.display = "inline-block";
          badge.innerText = count;
        } else {
          badge.style.display = "none";
        }
      });
  }

  // ✅ On load
  window.onload = () => {
    fetchReports();
    listenNewReports();
  }

