// SIDEBAR DROPDOWN
const allDropdown = document.querySelectorAll('#sidebar .side-dropdown');
const sidebar = document.getElementById('sidebar');

allDropdown.forEach(item=> {
  const a = item.parentElement.querySelector('a:first-child');
  a.addEventListener('click', function (e) {
    e.preventDefault();

    if(!this.classList.contains('active')) {
      allDropdown.forEach(i=> {
        const aLink = i.parentElement.querySelector('a:first-child');

        aLink.classList.remove('active');
        i.classList.remove('show');
      });
    }

    this.classList.toggle('active');
    item.classList.toggle('show');
  });
});

// SIDEBAR COLLAPSE
const toggleSidebar = document.querySelector('nav .toggle-sidebar');
const allSideDivider = document.querySelectorAll('#sidebar .divider');

if(sidebar.classList.contains('hide')) {
  allSideDivider.forEach(item=> {
    item.textContent = '-'
  });
  allDropdown.forEach(item=> {
    const a = item.parentElement.querySelector('a:first-child');
    a.classList.remove('active');
    item.classList.remove('show');
  });
} else {
  allSideDivider.forEach(item=> {
    item.textContent = item.dataset.text;
  });
}

toggleSidebar.addEventListener('click', function () {
  sidebar.classList.toggle('hide');

  if(sidebar.classList.contains('hide')) {
    allSideDivider.forEach(item=> {
      item.textContent = '-'
    });

    allDropdown.forEach(item=> {
      const a = item.parentElement.querySelector('a:first-child');
      a.classList.remove('active');
      item.classList.remove('show');
    });
  } else {
    allSideDivider.forEach(item=> {
      item.textContent = item.dataset.text;
    });
  }
});

sidebar.addEventListener('mouseleave', function () {
  if(this.classList.contains('hide')) {
    allDropdown.forEach(item=> {
      const a = item.parentElement.querySelector('a:first-child');
      a.classList.remove('active');
      item.classList.remove('show');
    });
    allSideDivider.forEach(item=> {
      item.textContent = '-'
    });
  }
});

sidebar.addEventListener('mouseenter', function () {
  if(this.classList.contains('hide')) {
    allDropdown.forEach(item=> {
      const a = item.parentElement.querySelector('a:first-child');
      a.classList.remove('active');
      item.classList.remove('show');
    });
    allSideDivider.forEach(item=> {
      item.textContent = item.dataset.text;
    });
  }
});

// PROFILE DROPDOWN
const profile = document.querySelector('nav .profile');
const imgProfile = profile.querySelector('img');
const dropdownProfile = profile.querySelector('.profile-link');

imgProfile.addEventListener('click', function () {
  dropdownProfile.classList.toggle('show');
});

// MENU
const allMenu = document.querySelectorAll('main .content-data .head .menu');

allMenu.forEach(item=> {
  const icon = item.querySelector('.icon');
  const menuLink = item.querySelector('.menu-link');

  icon.addEventListener('click', function () {
    menuLink.classList.toggle('show');
  });
});

window.addEventListener('click', function (e) {
  if(e.target !== imgProfile) {
    if(e.target !== dropdownProfile) {
      if(dropdownProfile.classList.contains('show')) {
        dropdownProfile.classList.remove('show');
      }
    }
  }

  allMenu.forEach(item=> {
    const icon = item.querySelector('.icon');
    const menuLink = item.querySelector('.menu-link');

    if(e.target !== icon) {
      if(e.target !== menuLink) {
        if (menuLink.classList.contains('show')) {
          menuLink.classList.remove('show');
        }
      }
    }
  });
});


// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD9h0g0YOKvq7_6HpD9ftGyH0bXfxXNLIk",
  authDomain: "parkingapp-47d6d.firebaseapp.com",
  projectId: "parkingapp-47d6d",
  storageBucket: "parkingapp-47d6d.appspot.com",
  messagingSenderId: "77735745622",
  appId: "1:77735745622:web:37682bcfabdcfd2f47c3f7",
  measurementId: "G-FH3WFGN2Q5"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Update dashboard counts
function updateCounts() {
  db.collection("bookings").get().then(snapshot => {
    document.getElementById("ticketCount").textContent = snapshot.size;
    const prog = document.querySelectorAll('.progress')[0];
    if(prog) prog.style.setProperty('--value', `${Math.min(snapshot.size, 100)}%`);
  });
  db.collection("Owner").get().then(snapshot => {
    document.getElementById("ownerCount").textContent = snapshot.size;
    const prog = document.querySelectorAll('.progress')[1];
    if(prog) prog.style.setProperty('--value', `${Math.min(snapshot.size, 100)}%`);
  });
  db.collection("users").get().then(snapshot => {
    document.getElementById("userCount").textContent = snapshot.size;
    const prog = document.querySelectorAll('.progress')[2];
    if(prog) prog.style.setProperty('--value', `${Math.min(snapshot.size, 100)}%`);
  });
  db.collection("parking").get().then(snapshot => {
    document.getElementById("parkingCount").textContent = snapshot.size;
    const prog = document.querySelectorAll('.progress')[3];
    if(prog) prog.style.setProperty('--value', `${Math.min(snapshot.size, 100)}%`);
  });
}

// Load Parking table data
function loadParkingTable() {
  const tableBody = document.querySelector("#parkingTable tbody");
  db.collection("parking").orderBy("timestamp", "desc").get().then(snapshot => {
    tableBody.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${data.nameparking || "-"}</td>
        <td>${data.packageType || "-"}</td>
        <td>${data.isActive || "-"}</td>
        <td>${data.car_slot || "-"}</td>
        <td>${data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleString() : "-"}</td>
      `;
      tableBody.appendChild(tr);
    });
  }).catch(error => {
    console.error("Error fetching parking data:", error);
  });
}

// PROGRESSBAR initialization (if you have CSS variables)
const allProgress = document.querySelectorAll('main .card .progress');
allProgress.forEach(item=> {
  item.style.setProperty('--value', item.dataset.value);
});

// ApexCharts setup (daily revenue)
const formatDate = (date) => date.toISOString().split('T')[0];

document.addEventListener("DOMContentLoaded", async () => {
  const billsRef = db.collection("parking_bill");
  const snapshot = await billsRef.get();

  const dailyTotals = {};
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  snapshot.forEach(doc => {
    const data = doc.data();
    if (!data.timestamp || !data.totalprice) return;

    const date = new Date(data.timestamp.seconds * 1000);
    if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
      const dayKey = formatDate(date);
      dailyTotals[dayKey] = (dailyTotals[dayKey] || 0) + Number(data.totalprice);
    }
  });

  const allDates = Object.keys(dailyTotals).sort();
  const allTotals = allDates.map(date => dailyTotals[date]);

  // Populate dropdown filter
  const select = document.getElementById('dayFilter');
  allDates.forEach(date => {
    const opt = document.createElement('option');
    opt.value = date;
    opt.textContent = date;
    select.appendChild(opt);
  });

  // Chart render function
  let currentChart;
  const renderChart = (dates, totals) => {
    if (currentChart) {
      currentChart.destroy();
    }

    currentChart = new ApexCharts(document.querySelector("#chart-bar"), {
      chart: {
        type: 'bar',
        height: 350
      },
      title: {
        text: 'Daily Revenue This Month'
      },
      series: [{
        name: 'Total Revenue (₭)',
        data: totals
      }],
      xaxis: {
        categories: dates
      },
      colors: ['#00B894'],
      dataLabels: {
        enabled: true
      }
    });

    currentChart.render();
  };

  // Initial full chart
  renderChart(allDates, allTotals);

  // Filter event
  select.addEventListener('change', () => {
    const val = select.value;
    if (!val) {
      renderChart(allDates, allTotals);
    } else {
      renderChart([val], [dailyTotals[val]]);
    }
  });
});

// Active menu link highlight
const currentPage = window.location.pathname.split("/").pop();
const menuLinks = document.querySelectorAll('.side-menu li a');

menuLinks.forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage) {
    link.classList.add('active');
  }
});

// Listen for new chat messages and show popup notifications
function listenNewMessages() {
  db.collection('chats')
    .onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === "added") {
          const chatId = change.doc.id;
          const messageRef = db.collection(`chats/${chatId}/messages`)
                               .orderBy("timestamp", "desc")
                               .limit(1);
          messageRef.get().then(msgSnap => {
            const latest = msgSnap.docs[0]?.data();
            if (latest?.senderId !== 'admin') {
              showNotification(chatId, latest?.text);
            }
          });
        }
      });
    });
}

function showNotification(chatId, message) {
  const notification = document.createElement("div");
  notification.innerHTML = `
    <div style="position:fixed; bottom:20px; right:20px; background:#fff; border:1px solid #ccc; padding:10px 20px; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.1); z-index:9999;">
      <strong>New Message</strong><br/>
      ${message}
      <br/><a href="/admin/chat.html?chatId=${chatId}">Open Chat</a>
    </div>`;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 8000);
}

// Listen to unread reports and update notification badge
function listenNewReports() {
  db.collection("Reports")
    .where("isRead", "==", false)
    .onSnapshot(snapshot => {
      const count = snapshot.size;
      const badge = document.getElementById("notification-badge");

      if (count > 0) {
        badge.style.display = "inline-block";
        badge.textContent = count;
      } else {
        badge.style.display = "none";
      }
    });
}
document.querySelector('a.nav-link').addEventListener('click', async (e) => {
  e.preventDefault(); // ถ้าอยากให้เปิดลิงก์หลังทำงานเสร็จให้ลบบรรทัดนี้

  try {
    // ดึงเอกสารที่ยังไม่ได้อ่าน
    const snapshot = await db.collection("Reports").where("isRead", "==", false).get();

    const batch = db.batch();

    snapshot.forEach(doc => {
      const docRef = db.collection("Reports").doc(doc.id);
      batch.update(docRef, { isRead: true });
    });

    await batch.commit();

    // อัปเดต badge หรือรีเฟรชข้อมูลถ้าจำเป็น
    document.getElementById("notification-badge").style.display = 'none';

    // เปิดหน้า report.html หลังจาก update เสร็จ (ถ้าไม่ต้องการปิด e.preventDefault() ออก)
    window.location.href = 'report.html';

  } catch (error) {
    console.error("Error marking reports as read:", error);
  }
});

// On page load, initialize everything
window.addEventListener("DOMContentLoaded", () => {
  updateCounts();
  loadParkingTable();
  listenNewReports();
  listenNewMessages();
});
