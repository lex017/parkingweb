document.addEventListener("DOMContentLoaded", function () {
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

  // Initialize Firebase only once
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const db = firebase.firestore();

  // Element references
  const tableBody = document.querySelector("#table-body");

  // Create update form container
  const updateFormContainer = document.createElement("div");
  updateFormContainer.id = "update-form";
  updateFormContainer.style.display = "none";
  updateFormContainer.style.marginTop = "20px";
  updateFormContainer.innerHTML = `
    <h3>Update User</h3>
    <input type="text" id="update-username" placeholder="New username"><br><br>
    <input type="email" id="update-email" placeholder="New email"><br><br>
    <input type="text" id="update-password" placeholder="New password"><br><br>
    <button id="submit-update">Submit</button>
    <button id="cancel-update">Cancel</button>
    <hr>
  `;
  document.querySelector("#user-data").appendChild(updateFormContainer);

  const updateUsername = document.getElementById("update-username");
  const updateEmail = document.getElementById("update-email");
  const updatePassword = document.getElementById("update-password");
  const submitUpdate = document.getElementById("submit-update");
  const cancelUpdate = document.getElementById("cancel-update");

  let selectedUserId = null;

  cancelUpdate.addEventListener("click", () => {
    updateFormContainer.style.display = "none";
    selectedUserId = null;
  });

  submitUpdate.addEventListener("click", () => {
    if (selectedUserId) {
      db.collection("users").doc(selectedUserId).update({
        username: updateUsername.value,
        email: updateEmail.value,
        password: updatePassword.value
      }).then(() => {
        alert("User updated successfully!");
        updateFormContainer.style.display = "none";
        selectedUserId = null;
      }).catch((error) => {
        console.error("Error updating user:", error);
      });
    }
  });

  // Load and listen user collection
  db.collection("users").onSnapshot((querySnapshot) => {
    tableBody.innerHTML = "";

    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${userData.username || "N/A"}</td>
        <td>${userData.email || "N/A"}</td>
        <td>${userData.password || "N/A"}</td>
        <td>
          <button class="update-btn" data-id="${doc.id}" 
            data-username="${userData.username || ""}" 
            data-email="${userData.email || ""}" 
            data-password="${userData.password || ""}">
            Update
          </button>
          <button class="delete-btn" data-id="${doc.id}">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    // Delete buttons event
    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const userId = e.target.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this user?")) {
          db.collection("users").doc(userId).delete()
            .then(() => alert("User deleted successfully!"))
            .catch((error) => console.error("Error deleting user:", error));
        }
      });
    });

    // Update buttons event
    document.querySelectorAll(".update-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        selectedUserId = button.getAttribute("data-id");
        updateUsername.value = button.getAttribute("data-username");
        updateEmail.value = button.getAttribute("data-email");
        updatePassword.value = button.getAttribute("data-password");
        updateFormContainer.style.display = "block";
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

  // You can also call updateCounts(), loadParkingTable() here if you have those functions
});
