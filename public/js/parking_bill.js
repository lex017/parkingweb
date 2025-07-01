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
    db.collection("parking_bill").orderBy("timestamp", "desc").onSnapshot((querySnapshot) => {
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
                <td>${userData.name || "N/A"}</td>
                <td>${userData.price || "N/A"}</td>
                <td>${userData.status || "N/A"}</td>
                <td>${userData.slots|| "N/A"}</td>
                <td>${userData.totalPrice|| "N/A"}</td>
                <td>${userData.locationId|| "N/A"}</td>
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
                db.collection("parking_bill").doc(userId).delete()
                    .then(() => alert("Payment deleted successfully!"))
                    .catch((error) => console.error("Error deleting payment:", error));
            });
        });
    });
});

