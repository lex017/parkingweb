document.addEventListener("DOMContentLoaded", function () {
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
    const tableBody = document.querySelector("#table-container tbody");

    // Fetch data from Firestore and update table
    db.collection("payments").orderBy("timestamp", "desc").onSnapshot((querySnapshot) => {
        tableBody.innerHTML = ""; // Clear existing table data

        querySnapshot.forEach((doc) => {
            const userData = doc.data();

            // Convert Firestore timestamp to a human-readable string
            let formattedTimestamp = "N/A";
            if (userData.timestamp instanceof firebase.firestore.Timestamp) {
                formattedTimestamp = userData.timestamp.toDate().toLocaleString(); // Format timestamp
            }

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${userData.userName || "N/A"}</td>
                <td>${userData.amount || "N/A"}</td>
                <td>${userData.status || "N/A"}</td>
                <td>${userData.vechicle || "N/A"}</td>
                <td>${formattedTimestamp}</td>  <!-- Display the formatted timestamp -->
                <td>
                    <img src="${userData.imageBill || 'default-image.jpg'}" alt="User Image" class="image-zoom" style="width: 100px; height: 100px; cursor: pointer;">
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Get the modal and navbar
        var modal = document.getElementById("zoomModal");
        var modalImg = document.getElementById("zoomedImage");
        var captionText = document.getElementById("caption");
        var closeBtn = document.getElementById("closeZoomModal");
        var nav = document.querySelector("nav"); // Select the navbar

        // Add click event listener to all images with class 'image-zoom'
        document.querySelectorAll(".image-zoom").forEach((img) => {
            img.onclick = function () {
                modal.style.display = "block";
                modalImg.src = this.src;
                captionText.innerHTML = this.alt;
                nav.style.display = "none"; // Hide the navbar when image is zoomed
            };
        });

        // When the user clicks on <span> (x), close the modal
        closeBtn.onclick = function () {
            modal.style.display = "none";
            nav.style.display = "flex"; // Show the navbar again when modal is closed
        };

        // Close the modal if clicked outside of it
        modal.onclick = function (e) {
            if (e.target === modal) {
                modal.style.display = "none";
                nav.style.display = "flex"; // Show the navbar again if clicked outside modal
            }
        };

        // Delete user from Firestore (if needed)
        document.querySelectorAll(".delete-btn").forEach((button) => {
            button.addEventListener("click", (e) => {
                const userId = e.target.getAttribute("data-id");
                db.collection("payments").doc(userId).delete()
                    .then(() => alert("Payment deleted successfully!"))
                    .catch((error) => console.error("Error deleting payment:", error));
            });
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

  // Listen for new chat messages and show notifications
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

  // Listen to unread reports and update badge
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

  // Click event to mark Reports as read and navigate
  const reportLink = document.querySelector('a.nav-link');
  if (reportLink) {
    reportLink.addEventListener('click', async (e) => {
      e.preventDefault();

      try {
        const snapshot = await db.collection("Reports").where("isRead", "==", false).get();
        const batch = db.batch();

        snapshot.forEach(doc => {
          const docRef = db.collection("Reports").doc(doc.id);
          batch.update(docRef, { isRead: true });
        });

        await batch.commit();

        document.getElementById("notification-badge").style.display = 'none';

        window.location.href = 'report.html';

      } catch (error) {
        console.error("Error marking reports as read:", error);
      }
    });
  }

  // Initialize listeners on page load
  listenNewReports();
  listenNewMessages();

});

