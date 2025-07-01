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
    db.collection("parking_bill").orderBy("timestamp", "desc").onSnapshot((querySnapshot) => {
        tableBody.innerHTML = ""; // Clear existing table data

        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            const billId = doc.id;

            // Convert Firestore timestamp to a human-readable string
            let formattedTimestamp = "N/A";
            if (userData.timestamp instanceof firebase.firestore.Timestamp) {
                formattedTimestamp = userData.timestamp.toDate().toLocaleString();
            }

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${userData.nameparking || "N/A"}</td>
                <td>${userData.totalPrice|| "N/A"}</td>
                <td>${userData.car_slot || "N/A"}</td>
                <td>${userData.status || "Pending"}</td>
                <td>${userData.packageType || "N/A"}</td>
                <td>${userData.tag || "N/A"}</td>
                <td>${formattedTimestamp}</td>
                <td>
                    <button class="verify-btn" data-id="${billId}" ${userData.status === "success" ? "disabled" : ""}>
                        ${userData.status === "success" ? "Verified" : "Verify"}
                    </button>
                    <button class="reject-btn" data-id="${billId}" ${userData.status === "rejected" ? "disabled" : ""}>
                        ${userData.status === "rejected" ? "Rejected" : "Reject"}
                    </button>
                    <button class="check-payment-btn" data-id="${billId}">
                        Check Payment
                    </button>
                </td>

                <td id="payment-details-${billId}" class="payment-details">
                    <!-- Payment details will be shown here -->
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Attach event listener to "Verify" buttons
        document.querySelectorAll(".verify-btn").forEach((button) => {
            button.addEventListener("click", (e) => {
                const billId = e.target.getAttribute("data-id");
                showVerifyDialog(billId);
            });
        });
        // Attach event listener to "Reject" buttons
        document.querySelectorAll(".reject-btn").forEach((button) => {
            button.addEventListener("click", (e) => {
                const billId = e.target.getAttribute("data-id");
                showRejectDialog(billId);
            });
        });

        // Attach event listener to "Check Payment" buttons
        document.querySelectorAll(".check-payment-btn").forEach((button) => {
            button.addEventListener("click", (e) => {
                const billId = e.target.getAttribute("data-id");
                checkPaymentDetails(billId);
            });
        });
    });
});

// Show confirmation dialog for verifying payment
function showVerifyDialog(billId) {
    // Create a modal dynamically
    const modal = document.createElement("div");
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <h2>Confirm Verification</h2>
                <p>Are you sure you want to verify payment for Booking ID: <strong>${billId}</strong>?</p>
                <button id="confirmVerify" class="btn-confirm">Confirm</button>
                <button id="cancelVerify" class="btn-cancel">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Click event for confirm button
    document.getElementById("confirmVerify").addEventListener("click", function () {
        verifyPayment(billId);
        document.body.removeChild(modal);
    });

    // Click event for cancel button
    document.getElementById("cancelVerify").addEventListener("click", function () {
        document.body.removeChild(modal);
    });
}

// Function to verify payment in Firestore
function verifyPayment(billId) {
    const bookingRef = firebase.firestore().collection("parking_bill").doc(billId);

    bookingRef.get().then((billDoc) => {
        if (!billDoc.exists) {
            console.warn(`No booking found for billId: ${billId}`);
            alert(`No booking found for Booking ID: ${billId}`);
            return;
        }

        const billData = billDoc.data();
        const locationId = billData.locationId;

        if (!locationId) {
            console.warn(`No locationId found for billId: ${billId}`);
            alert(`No payment associated with Booking ID: ${billId}`);
            return;
        }

        const paymentRef = firebase.firestore().collection("parking_bill").doc(locationId);

        // Update Firestore to mark the payment as verified
        bookingRef.update({ status: "success" })
            .then(() => paymentRef.update({ status: "success" }))
            .then(() => alert(`Payment Verified for Booking ID: ${billId}`))
            .catch((error) => console.error("Error verifying payment:", error));
    }).catch((error) => {
        console.error("Error fetching booking details:", error);
    });
}

function showRejectDialog(billId) {
    const modal = document.createElement("div");
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <h2>Reject Payment</h2>
                <p>Are you sure you want to reject payment for Booking ID: <strong>${billId}</strong>?</p>
                <button id="confirmReject" class="btn-reject">Reject</button>
                <button id="cancelReject" class="btn-cancel">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);

    document.getElementById("confirmReject").addEventListener("click", function () {
        rejectPayment(billId);
        document.body.removeChild(modal);
    });

    document.getElementById("cancelReject").addEventListener("click", function () {
        document.body.removeChild(modal);
    });
}

function rejectPayment(billId) {
    const bookingRef = firebase.firestore().collection("parking_bill").doc(billId);

    bookingRef.get().then((billDoc) => {
        if (!billDoc.exists) {
            alert(`No booking found for Booking ID: ${billId}`);
            return;
        }

        const billData = billDoc.data();
        const locationId = billData.locationId;

        if (!locationId) {
            alert(`No payment associated with Booking ID: ${billId}`);
            return;
        }

        const paymentRef = firebase.firestore().collection("parking_bill").doc(locationId);

        // Update both booking and payment status
        bookingRef.update({ status: "rejected" })
            .then(() => paymentRef.update({ status: "rejected" }))
            .then(() => alert(`Payment Rejected for Booking ID: ${billId}`))
            .catch((error) => console.error("Error rejecting payment:", error));
    }).catch((error) => {
        console.error("Error fetching booking:", error);
    });
}

// Function to check payment details (like image URL and amount)
function checkPaymentDetails(billId) {
    const billRef = firebase.firestore().collection("parking_bill").doc(billId);

    billRef.get().then((billDoc) => {
        if (!billDoc.exists) {
            console.warn(`No booking found for billId: ${billId}`);
            alert(`No booking found for Booking ID: ${billId}`);
            return;
        }

        const billData = billDoc.data();
        const detailsCell = document.getElementById(`payment-details-${billId}`);

        if (!detailsCell) {
            console.error(`Error: Element #payment-details-${billId} not found.`);
            return;
        }

        const imageBill = billData.imageBill || "";
        const totalPrice = billData.totalPrice || "totalPrice not specified";

        if (!imageBill) {
            detailsCell.innerHTML = `<p>No image available</p>`;
        } else {
            detailsCell.innerHTML = `
                <div>
                    <img src="${imageBill}" alt="Payment Image" style="width: 100px; height: 100px;" class="payment-image"/>
                    <p>totalPrice: ${totalPrice} Kip</p>
                </div>
            `;

            const imageElement = detailsCell.querySelector(".payment-image");
            imageElement.addEventListener("click", function () {
                zoomImage(imageBill);
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

