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

    // Fetch data from Firestore and update table
    db.collection("Owner").onSnapshot((querySnapshot) => {
        tableBody.innerHTML = ""; // Clear existing table data

        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            const newOwnerId = doc.id;

            // Convert Firestore timestamp to a human-readable string
            let formattedTimestamp = "N/A";
            if (userData.timestamp instanceof firebase.firestore.Timestamp) {
                formattedTimestamp = userData.timestamp.toDate().toLocaleString();
            }

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${userData.fname || "N/A"}</td>
                <td>${userData.lname|| "N/A"}</td>
                <td>${userData.age || "N/A"}</td>
                <td>${userData.email || "Pending"}</td>
                <td>${userData.idcard || "N/A"}</td>
                <td>${userData.status || "N/A"}</td>
                <td>${userData.verify || "N/A"}</td>
                <td>${formattedTimestamp}</td>
                <td>
                    <button class="verify-btn" data-id="${newOwnerId}" ${userData.verify === "success" ? "disabled" : ""}>
                        ${userData.verify === "success" ? "Verified" : "Verify"}
                    </button>
                    <button class="reject-btn" data-id="${newOwnerId}" ${userData.verify === "rejected" ? "disabled" : ""}>
                        ${userData.verify === "rejected" ? "Rejected" : "Reject"}
                    </button>
                    <button class="check-payment-btn" data-id="${newOwnerId}">
                        Check Payment
                    </button>
                </td>

                <td id="payment-details-${newOwnerId}" class="payment-details">
                    <!-- Payment details will be shown here -->
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Attach event listener to "Verify" buttons
        document.querySelectorAll(".verify-btn").forEach((button) => {
            button.addEventListener("click", (e) => {
                const newOwnerId = e.target.getAttribute("data-id");
                showVerifyDialog(newOwnerId);
            });
        });
        // Attach event listener to "Reject" buttons
        document.querySelectorAll(".reject-btn").forEach((button) => {
            button.addEventListener("click", (e) => {
                const newOwnerId = e.target.getAttribute("data-id");
                showRejectDialog(newOwnerId);
            });
        });

        // Attach event listener to "Check Payment" buttons
        document.querySelectorAll(".check-payment-btn").forEach((button) => {
            button.addEventListener("click", (e) => {
                const newOwnerId = e.target.getAttribute("data-id");
                checkPaymentDetails(newOwnerId);
            });
        });
    });
});

// Show confirmation dialog for verifying payment
function showVerifyDialog(newOwnerId) {
    // Create a modal dynamically
    const modal = document.createElement("div");
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <h2>Confirm Verification</h2>
                <p>Are you sure you want to verify payment for Booking ID: <strong>${newOwnerId}</strong>?</p>
                <button id="confirmVerify" class="btn-confirm">Confirm</button>
                <button id="cancelVerify" class="btn-cancel">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Click event for confirm button
    document.getElementById("confirmVerify").addEventListener("click", function () {
        verifyPayment(newOwnerId);
        document.body.removeChild(modal);
    });

    // Click event for cancel button
    document.getElementById("cancelVerify").addEventListener("click", function () {
        document.body.removeChild(modal);
    });
}

// Function to verify payment in Firestore
function verifyPayment(newOwnerId) {
    const ownerRef = firebase.firestore().collection("Owner").doc(newOwnerId);

    ownerRef.update({ verify: "success" })
        .then(() => {
            alert(`Verification successful for Owner ID: ${newOwnerId}`);
            const button = document.querySelector(`button.verify-btn[data-id="${newOwnerId}"]`);
            if (button) {
                button.textContent = "Verified";
                button.disabled = true;
            }
        })
        .catch((error) => {
            console.error("Error verifying payment:", error);
            alert("Failed to verify. Please try again.");
        });
}


function showRejectDialog(newOwnerId) {
    const modal = document.createElement("div");
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <h2>Reject Payment</h2>
                <p>Are you sure you want to reject payment for Booking ID: <strong>${newOwnerId}</strong>?</p>
                <button id="confirmReject" class="btn-reject">Reject</button>
                <button id="cancelReject" class="btn-cancel">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);

    document.getElementById("confirmReject").addEventListener("click", function () {
        rejectPayment(newOwnerId);
        document.body.removeChild(modal);
    });

    document.getElementById("cancelReject").addEventListener("click", function () {
        document.body.removeChild(modal);
    });
}

function rejectPayment(newOwnerId) {
    const bookingRef = firebase.firestore().collection("Owner").doc(newOwnerId);

    bookingRef.get().then((billDoc) => {
        if (!billDoc.exists) {
            alert(`No booking found for Booking ID: ${newOwnerId}`);
            return;
        }

        const billData = billDoc.data();
        const locationId = billData.locationId;

        if (!locationId) {
            alert(`No payment associated with Booking ID: ${newOwnerId}`);
            return;
        }

        const paymentRef = firebase.firestore().collection("Owner").doc(locationId);

        // Update both booking and payment status
        bookingRef.update({ status: "rejected" })
            .then(() => paymentRef.update({ status: "rejected" }))
            .then(() => alert(`Payment Rejected for Booking ID: ${newOwnerId}`))
            .catch((error) => console.error("Error rejecting payment:", error));
    }).catch((error) => {
        console.error("Error fetching booking:", error);
    });
}

// Function to check payment details (like image URL and amount)
function checkPaymentDetails(newOwnerId) {
    const billRef = firebase.firestore().collection("Owner").doc(newOwnerId);

    billRef.get().then((billDoc) => {
        if (!billDoc.exists) {
            console.warn(`No booking found for newOwnerId: ${newOwnerId}`);
            alert(`No booking found for Booking ID: ${newOwnerId}`);
            return;
        }

        const billData = billDoc.data();
        const detailsCell = document.getElementById(`payment-details-${newOwnerId}`);

        if (!detailsCell) {
            console.error(`Error: Element #payment-details-${newOwnerId} not found.`);
            return;
        }

        const profile_image_url = billData.profile_image_url || "";
    

        if (!profile_image_url) {
            detailsCell.innerHTML = `<p>No image available</p>`;
        } else {
            detailsCell.innerHTML = `
                <div>
                    <img src="${profile_image_url}" alt="Payment Image" style="width: 100px; height: 100px;" class="payment-image"/>
                    
                </div>
            `;

            const imageElement = detailsCell.querySelector(".payment-image");
            imageElement.addEventListener("click", function () {
                zoomImage(profile_image_url);
            });
        }
    }).catch((error) => {
        console.error("Error fetching booking/payment details:", error);
    });
}



// Function to zoom the image in a modal
function zoomImage(imageUrl) {
    // Create a modal for the image zoom
    const zoomModal = document.createElement("div");
    zoomModal.innerHTML = `
        <div class="zoom-modal-overlay">
            <div class="zoom-modal-content">
                <span class="zoom-close-btn">&times;</span>
                <img src="${imageUrl}" alt="Zoomed Payment Image" class="zoomed-image"/>
            </div>
        </div>
    `;
    document.body.appendChild(zoomModal);

    // Close the modal when close button is clicked
    document.querySelector(".zoom-close-btn").addEventListener("click", function () {
        document.body.removeChild(zoomModal);
    });

    // Close the modal if the overlay is clicked
    zoomModal.addEventListener("click", function (e) {
        if (e.target === zoomModal) {
            document.body.removeChild(zoomModal);
        }
    });
}
