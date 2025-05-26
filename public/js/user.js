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
    const tableBody = document.querySelector("#table-body");

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
        document.getElementById("update-form").style.display = "none";
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
                document.getElementById("update-form").style.display = "none";
                selectedUserId = null;
            }).catch((error) => {
                console.error("Error updating user:", error);
            });
        }
    });

    // Fetch data from Firestore and update table
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

        // Delete user
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

        // Update user
        document.querySelectorAll(".update-btn").forEach((button) => {
            button.addEventListener("click", (e) => {
                selectedUserId = button.getAttribute("data-id");
                updateUsername.value = button.getAttribute("data-username");
                updateEmail.value = button.getAttribute("data-email");
                updatePassword.value = button.getAttribute("data-password");
                document.getElementById("update-form").style.display = "block";
            });
        });
    });
});