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
    db.collection("Locations").onSnapshot((querySnapshot) => {
        tableBody.innerHTML = ""; // Clear existing table data

        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${userData.nameLocation|| "N/A"}</td>
                <td>${userData.address || "N/A"}</td>
                <td>${userData.description || "N/A"}</td>
                <td>${userData.car_slot || "N/A"}</td>
                <td>${userData.url || "N/A"}</td>
                <td>
                    <button class="update-btn" data-id="${doc.id}">Update</button>
                    <button class="delete-btn" data-id="${doc.id}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Delete user from Firestore
        document.querySelectorAll(".delete-btn").forEach((button) => {
            button.addEventListener("click", (e) => {
                const userId = e.target.getAttribute("data-id");
                db.collection("Locations").doc(userId).delete()
                    .then(() => alert("User deleted successfully!"))
                    .catch((error) => console.error("Error deleting user:", error));
            });
        });
    });
});
