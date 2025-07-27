// SIDEBAR DROPDOWN
const allDropdown = document.querySelectorAll('#sidebar .side-dropdown');
const sidebar = document.getElementById('sidebar');

allDropdown.forEach(item => {
    const a = item.parentElement.querySelector('a:first-child');
    a.addEventListener('click', function (e) {
        e.preventDefault();

        if (!this.classList.contains('active')) {
            allDropdown.forEach(i => {
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

// Initial check for sidebar hide class
if (sidebar.classList.contains('hide')) {
    allSideDivider.forEach(item => {
        item.textContent = '-'
    });
    allDropdown.forEach(item => {
        const a = item.parentElement.querySelector('a:first-child');
        a.classList.remove('active');
        item.classList.remove('show');
    });
} else {
    allSideDivider.forEach(item => {
        item.textContent = item.dataset.text;
    });
}

toggleSidebar.addEventListener('click', function () {
    sidebar.classList.toggle('hide');

    if (sidebar.classList.contains('hide')) {
        allSideDivider.forEach(item => {
            item.textContent = '-'
        });

        allDropdown.forEach(item => {
            const a = item.parentElement.querySelector('a:first-child');
            a.classList.remove('active');
            item.classList.remove('show');
        });
    } else {
        allSideDivider.forEach(item => {
            item.textContent = item.dataset.text;
        });
    }
});

sidebar.addEventListener('mouseleave', function () {
    if (this.classList.contains('hide')) {
        allDropdown.forEach(item => {
            const a = item.parentElement.querySelector('a:first-child');
            a.classList.remove('active');
            item.classList.remove('show');
        });
        allSideDivider.forEach(item => {
            item.textContent = '-'
        });
    }
});

sidebar.addEventListener('mouseenter', function () {
    if (this.classList.contains('hide')) {
        allDropdown.forEach(item => {
            const a = item.parentElement.querySelector('a:first-child');
            a.classList.remove('active');
            item.classList.remove('show');
        });
        allSideDivider.forEach(item => {
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

allMenu.forEach(item => {
    const icon = item.querySelector('.icon');
    const menuLink = item.querySelector('.menu-link');

    icon.addEventListener('click', function () {
        menuLink.classList.toggle('show');
    });
});

window.addEventListener('click', function (e) {
    if (e.target !== imgProfile) {
        if (e.target !== dropdownProfile) {
            if (dropdownProfile.classList.contains('show')) {
                dropdownProfile.classList.remove('show');
            }
        }
    }

    allMenu.forEach(item => {
        const icon = item.querySelector('.icon');
        const menuLink = item.querySelector('.menu-link');

        if (e.target !== icon) {
            if (e.target !== menuLink) {
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
    db.collection("parking_bill")
        .where("status", "==", "success") // Filter by status
        .get()
        .then(snapshot => {
            let total = 0;

            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.totalPrice) { // Changed from totalprice to totalPrice to match common casing
                    total += parseFloat(data.totalPrice);
                }
            });

            // Display total price in element with ID 'ticketCount'
            document.getElementById("ticketCount").textContent = total.toLocaleString() + " K";

            // Optional: show progress bar value
            const prog = document.querySelector('.progress');
            if (prog) {
                const maxValue = 5000000; // Set your target max value
                const progressValue = Math.min((total / maxValue) * 100, 100);
                prog.style.setProperty('--value', `${progressValue}%`);
            }
        })
        .catch(error => {
            console.error("Error getting parking_bill documents for counts: ", error);
        });

    db.collection("Owner").get().then(snapshot => {
        document.getElementById("ownerCount").textContent = snapshot.size;
        const prog = document.querySelectorAll('.progress')[1];
        if (prog) prog.style.setProperty('--value', `${Math.min(snapshot.size, 100)}%`);
    }).catch(error => console.error("Error getting Owner count: ", error));

    db.collection("users").get().then(snapshot => {
        document.getElementById("userCount").textContent = snapshot.size;
        const prog = document.querySelectorAll('.progress')[2];
        if (prog) prog.style.setProperty('--value', `${Math.min(snapshot.size, 100)}%`);
    }).catch(error => console.error("Error getting User count: ", error));

    db.collection("parking").get().then(snapshot => {
        document.getElementById("parkingCount").textContent = snapshot.size;
        const prog = document.querySelectorAll('.progress')[3];
        if (prog) prog.style.setProperty('--value', `${Math.min(snapshot.size, 100)}%`);
    }).catch(error => console.error("Error getting Parking count: ", error));
}

// Load Parking table data with optional date filter
function loadParkingTable(fromDate = null, toDate = null) {
    const tableBody = document.querySelector("#parkingTable tbody");
    if (!tableBody) {
        console.error("Parking table body not found.");
        return;
    }

    let query = db.collection("parking").orderBy("timestamp", "desc");

    if (fromDate) {
        const startOfDay = new Date(fromDate);
        startOfDay.setHours(0, 0, 0, 0);
        query = query.where("timestamp", ">=", firebase.firestore.Timestamp.fromDate(startOfDay));
    }
    if (toDate) {
        const endOfDay = new Date(toDate);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.where("timestamp", "<=", firebase.firestore.Timestamp.fromDate(endOfDay));
    }

    query.get().then(snapshot => {
        tableBody.innerHTML = ""; // Clear existing rows
        if (snapshot.empty) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No parking data available for this period.</td></tr>`;
            return;
        }
        snapshot.forEach(doc => {
            const data = doc.data();
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${data.nameparking || "-"}</td>
                <td>${data.packageType || "-"}</td>
                <td>${data.isActive !== undefined ? data.isActive : "-"}</td> <td>${data.car_slot || "-"}</td>
                <td>${data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleString() : "-"}</td>
            `;
            tableBody.appendChild(tr);
        });
    }).catch(error => {
        console.error("Error fetching parking data:", error);
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Error loading data: ${error.message}</td></tr>`;
    });
}

// PROGRESSBAR initialization (if you have CSS variables)
const allProgress = document.querySelectorAll('main .card .progress');
allProgress.forEach(item => {
    // Only set if data-value exists to avoid errors
    if (item.dataset.value) {
        item.style.setProperty('--value', item.dataset.value);
    }
});

// ApexCharts setup (daily revenue)
const formatDate = (date) => date.toISOString().split('T')[0];

// Declare currentChart globally to be accessible by filter function
let currentChart;

const renderChart = (dates, totals, title = 'Daily Revenue This Month') => {
    const chartContainer = document.querySelector("#chart-bar");
    if (!chartContainer) {
        console.error("Chart container with ID 'chart-bar' not found.");
        return;
    }

    if (currentChart) {
        currentChart.destroy();
    }

    // Console logs for debugging data passed to chart
    console.log("Rendering chart with Dates:", dates);
    console.log("Rendering chart with Totals:", totals);
    console.log("Chart Title:", title);

    currentChart = new ApexCharts(chartContainer, {
        chart: {
            type: 'bar',
            height: 350,
            toolbar: {
                show: false // Hide default toolbar if not needed
            }
        },
        title: {
            text: title,
            align: 'center',
            style: {
                fontSize: '16px',
                fontWeight: 'bold',
                fontFamily: undefined,
                color: '#263238'
            },
        },
        series: [{
            name: 'Total Revenue (₭)',
            data: totals
        }],
        xaxis: {
            categories: dates,
            title: {
                text: 'Date'
            }
        },
        yaxis: {
            title: {
                text: 'Revenue (₭)'
            },
            labels: {
                formatter: function (value) {
                    return value.toLocaleString(); // Format Y-axis labels
                }
            }
        },
        colors: ['#0031b8ff'],
        dataLabels: {
            enabled: true,
            formatter: function (val) {
                return val.toLocaleString(); // Format data labels
            }
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return val.toLocaleString() + " ₭"
                }
            }
        }
    });

    currentChart.render();
};

async function loadAndRenderChart(fromDate = null, toDate = null) {
    console.log("loadAndRenderChart called with fromDate:", fromDate, "toDate:", toDate);

    const billsRef = db.collection("parking_bill");
    let query = billsRef;

    if (fromDate) {
        const startOfDay = new Date(fromDate);
        startOfDay.setHours(0, 0, 0, 0);
        query = query.where("timestamp", ">=", firebase.firestore.Timestamp.fromDate(startOfDay));
        console.log("Applying fromDate filter:", startOfDay.toISOString());
    }
    if (toDate) {
        const endOfDay = new Date(toDate);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.where("timestamp", "<=", firebase.firestore.Timestamp.fromDate(endOfDay));
        console.log("Applying toDate filter:", endOfDay.toISOString());
    }

    try {
        const snapshot = await query.get();
        console.log("Firestore Snapshot Size for Chart Data:", snapshot.size);

        const dailyTotals = {};
        const chartTitle = (fromDate && toDate) ? `Daily Revenue from ${fromDate.toLocaleDateString()} to ${toDate.toLocaleDateString()}` : 'Daily Revenue This Month';

        snapshot.forEach(doc => {
            const data = doc.data();
            // console.log("Processing document for chart:", doc.id, data); // Too verbose, uncomment if deeply debugging single doc

            // IMPORTANT: Check for correct field names and types (totalPrice instead of totalprice)
            if (!data.timestamp || typeof data.timestamp.seconds === 'undefined' || data.totalPrice === undefined || data.totalPrice === null) {
                console.warn(`Skipping document ${doc.id} due to missing/malformed timestamp or totalPrice. Data:`, data);
                return;
            }

            const date = new Date(data.timestamp.seconds * 1000);
            const dayKey = formatDate(date);
            const price = Number(data.totalPrice); // Ensure price is a number and using totalPrice

            if (isNaN(price)) {
                console.warn(`Skipping document ${doc.id} because totalPrice is not a valid number: ${data.totalPrice}`);
                return;
            }

            dailyTotals[dayKey] = (dailyTotals[dayKey] || 0) + price;
        });

        const allDates = Object.keys(dailyTotals).sort();
        const allTotals = allDates.map(date => dailyTotals[date]);

        console.log("Aggregated Daily Totals for Chart:", dailyTotals);
        console.log("Sorted Dates for Chart:", allDates);
        console.log("Corresponding Totals for Chart:", allTotals);

        // Populate dropdown filter
        const select = document.getElementById('dayFilter');
        if (select) {
            // Clear previous options
            select.innerHTML = '<option value="">All Days</option>'; // Add back "All Days" option

            allDates.forEach(date => {
                const opt = document.createElement('option');
                opt.value = date;
                opt.textContent = date;
                select.appendChild(opt);
            });

            // Re-attach event listener for dayFilter to avoid multiple listeners
            // Check if a listener already exists on this element
            if (select.chartDayFilterListener) {
                select.removeEventListener('change', select.chartDayFilterListener);
            }

            select.chartDayFilterListener = () => {
                const val = select.value;
                if (!val) {
                    // If "All Days" is selected, re-render the chart with the original filter range
                    loadAndRenderChart(fromDate, toDate);
                } else {
                    // Render only the selected day's data
                    renderChart([val], [dailyTotals[val]], `Revenue on ${val}`);
                }
            };
            select.addEventListener('change', select.chartDayFilterListener);
        }

        // Render the main chart
        renderChart(allDates, allTotals, chartTitle);

    } catch (error) {
        console.error("Error loading and rendering chart data:", error);
        const chartContainer = document.querySelector("#chart-bar");
        if (chartContainer) {
            chartContainer.innerHTML = '<p style="color: red; text-align: center; padding: 20px;">Error loading chart data. Please check console for details.</p>';
        }
    }
}

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
                    }).catch(error => console.error("Error fetching latest message:", error));
                }
            });
        }, error => console.error("Error listening to chats:", error));
}

// function showNotification(chatId, message) {
//     const notification = document.createElement("div");
//     notification.innerHTML = `
//         <div style="position:fixed; bottom:20px; right:20px; background:#fff; border:1px solid #ccc; padding:10px 20px; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.1); z-index:9999;">
//             <strong>New Message</strong><br/>
//             ${message}
//             <br/><a href="/admin/chat.html?chatId=${chatId}">Open Chat</a>
//         </div>`;
//     document.body.appendChild(notification);
//     setTimeout(() => notification.remove(), 8000);
// }

// Listen to unread reports and update notification badge
function listenNewReports() {
    db.collection("Reports")
        .where("isRead", "==", false)
        .onSnapshot(snapshot => {
            const count = snapshot.size;
            const badge = document.getElementById("notification-badge");

            if (badge) { // Ensure badge exists
                if (count > 0) {
                    badge.style.display = "inline-block";
                    badge.textContent = count;
                } else {
                    badge.style.display = "none";
                }
            }
        }, error => console.error("Error listening to reports:", error));
}

document.querySelector('a.nav-link').addEventListener('click', async (e) => {
    e.preventDefault(); // This will prevent the default link behavior immediately

    try {
        // Fetch unread documents
        const snapshot = await db.collection("Reports").where("isRead", "==", false).get();

        const batch = db.batch();

        snapshot.forEach(doc => {
            const docRef = db.collection("Reports").doc(doc.id);
            batch.update(docRef, { isRead: true });
        });

        await batch.commit();
        console.log("Reports marked as read successfully.");

        // Update badge or refresh data if necessary
        const badge = document.getElementById("notification-badge");
        if (badge) {
            badge.style.display = 'none';
        }

        // Redirect after successful update
        window.location.href = 'report.html';

    } catch (error) {
        console.error("Error marking reports as read:", error);
        alert("Failed to mark reports as read. Please try again."); // User feedback
    }
});

// Function to handle dashboard data filtering
function filterDashboardData() {
    const fromDateInput = document.getElementById('parkingFromDate');
    const toDateInput = document.getElementById('parkingToDate');

    let fromDate = null;
    let toDate = null;

    if (fromDateInput && fromDateInput.value) {
        fromDate = new Date(fromDateInput.value);
    }
    if (toDateInput && toDateInput.value) {
        toDate = new Date(toDateInput.value);
    }

    // Call loadParkingTable with the selected dates
    loadParkingTable(fromDate, toDate);

    // Call loadAndRenderChart with the selected dates
    loadAndRenderChart(fromDate, toDate);
}


// On page load, initialize everything
window.addEventListener("DOMContentLoaded", () => {
    updateCounts();
    // Initially load tables and charts without date filter (or with default month)
    loadParkingTable();
    loadAndRenderChart(); // Load current month's chart by default
    listenNewReports();
    listenNewMessages();

    // Add event listener for the new filter button
    const filterBtn = document.getElementById('filterDashboardDataBtn');
    if (filterBtn) {
        filterBtn.addEventListener('click', filterDashboardData);
    }

    // Optional: Add listeners to date inputs themselves to filter on change
    // This allows filtering as soon as a date is picked/changed, without a separate button click
    const fromDateInput = document.getElementById('parkingFromDate');
    const toDateInput = document.getElementById('parkingToDate');
    if (fromDateInput) {
        fromDateInput.addEventListener('change', filterDashboardData);
    }
    if (toDateInput) {
        toDateInput.addEventListener('change', filterDashboardData);
    }
});