document.addEventListener("DOMContentLoaded", () => {
    const firebaseConfig = {
      apiKey: "AIzaSyD9h0g0YOKvq7_6HpD9ftGyH0bXfxXNLIk",
      authDomain: "parkingapp-47d6d.firebaseapp.com",
      projectId: "parkingapp-47d6d",
      storageBucket: "parkingapp-47d6d.appspot.com",
      messagingSenderId: "77735745622",
      appId: "1:77735745622:web:37682bcfabdcfd2f47c3f7",
      measurementId: "G-FH3WFGN2Q5"
    };

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.firestore();
    const tableBody = document.getElementById("table-body");

    const updateModal = document.getElementById("updateModal");
    const modalUsername = document.getElementById("modal-username");
    const modalEmail = document.getElementById("modal-email");
    const modalPassword = document.getElementById("modal-password");
    const modalSubmit = document.getElementById("modal-submit");
    const modalCancel = document.getElementById("modal-cancel");

    let selectedUserId = null;

    function openUpdateModal(user) {
      selectedUserId = user.id;
      modalUsername.value = user.username || "";
      modalEmail.value = user.email || "";
      modalPassword.value = user.password || "";
      updateModal.style.display = "flex";
    }

    function closeUpdateModal() {
      updateModal.style.display = "none";
      selectedUserId = null;
    }

    modalCancel.addEventListener("click", closeUpdateModal);

    modalSubmit.addEventListener("click", () => {
      if (selectedUserId) {
        db.collection("users").doc(selectedUserId).update({
          username: modalUsername.value,
          email: modalEmail.value,
          password: modalPassword.value
        }).then(() => {
          alert("User updated successfully!");
          closeUpdateModal();
        }).catch((error) => {
          console.error("Error updating user:", error);
        });
      }
    });

    db.collection("users").onSnapshot((snapshot) => {
      tableBody.innerHTML = "";
      snapshot.forEach((doc) => {
        const data = doc.data();
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${data.username || "N/A"}</td>
          <td>${data.email || "N/A"}</td>
          <td>${data.password || "N/A"}</td>
          <td>
            <button class="update-btn" 
              data-id="${doc.id}" 
              data-username="${data.username || ""}" 
              data-email="${data.email || ""}" 
              data-password="${data.password || ""}">
              Update
            </button>
            <button class="delete-btn" data-id="${doc.id}">Delete</button>
          </td>
        `;
        tableBody.appendChild(row);
      });

      document.querySelectorAll(".update-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          openUpdateModal({
            id: btn.getAttribute("data-id"),
            username: btn.getAttribute("data-username"),
            email: btn.getAttribute("data-email"),
            password: btn.getAttribute("data-password"),
          });
        });
      });

      document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const userId = btn.getAttribute("data-id");
          if (confirm("Are you sure you want to delete this user?")) {
            db.collection("users").doc(userId).delete()
              .then(() => alert("User deleted successfully!"))
              .catch(err => console.error("Delete failed:", err));
          }
        });
      });
    });
  });