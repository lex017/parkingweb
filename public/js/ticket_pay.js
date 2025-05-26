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
    db.collection("bookings").onSnapshot((querySnapshot) => {
        tableBody.innerHTML = ""; // Clear existing table data

        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            const bookingId = doc.id;

            // Convert Firestore timestamp to a human-readable string
            let formattedTimestamp = "N/A";
            if (userData.timestamp instanceof firebase.firestore.Timestamp) {
                formattedTimestamp = userData.timestamp.toDate().toLocaleString();
            }

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${userData.paymentId || "N/A"}</td>
                <td>${userData.bookingDate || "N/A"}</td>
                <td>${userData.bookingTime || "N/A"}</td>
                <td>${userData.paymentStatus || "Pending"}</td>
                <td>${formattedTimestamp}</td>
                <td>${userData.userName || "N/A"}</td>
                <td>
                    <button class="verify-btn" data-id="${bookingId}" ${userData.paymentStatus === "success" ? "disabled" : ""}>
                        ${userData.paymentStatus === "success" ? "Verified" : "Verify"}
                    </button>
                    <button class="reject-btn" data-id="${bookingId}" ${userData.paymentStatus === "rejected" ? "disabled" : ""}>
                        ${userData.paymentStatus === "rejected" ? "Rejected" : "Reject"}
                    </button>
                    <button class="check-payment-btn" data-id="${bookingId}">
                        Check Payment
                    </button>
                </td>

                <td id="payment-details-${bookingId}" class="payment-details">
                    <!-- Payment details will be shown here -->
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Attach event listener to "Verify" buttons
        document.querySelectorAll(".verify-btn").forEach((button) => {
            button.addEventListener("click", (e) => {
                const bookingId = e.target.getAttribute("data-id");
                showVerifyDialog(bookingId);
            });
        });
        // Attach event listener to "Reject" buttons
        document.querySelectorAll(".reject-btn").forEach((button) => {
            button.addEventListener("click", (e) => {
                const bookingId = e.target.getAttribute("data-id");
                showRejectDialog(bookingId);
            });
        });

        // Attach event listener to "Check Payment" buttons
        document.querySelectorAll(".check-payment-btn").forEach((button) => {
            button.addEventListener("click", (e) => {
                const bookingId = e.target.getAttribute("data-id");
                checkPaymentDetails(bookingId);
            });
        });
    });
});

// Show confirmation dialog for verifying payment
function showVerifyDialog(bookingId) {
    // Create a modal dynamically
    const modal = document.createElement("div");
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <h2>Confirm Verification</h2>
                <p>Are you sure you want to verify payment for Booking ID: <strong>${bookingId}</strong>?</p>
                <button id="confirmVerify" class="btn-confirm">Confirm</button>
                <button id="cancelVerify" class="btn-cancel">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Click event for confirm button
    document.getElementById("confirmVerify").addEventListener("click", function () {
        verifyPayment(bookingId);
        document.body.removeChild(modal);
    });

    // Click event for cancel button
    document.getElementById("cancelVerify").addEventListener("click", function () {
        document.body.removeChild(modal);
    });
}

// Function to verify payment in Firestore
function verifyPayment(bookingId) {
    const bookingRef = firebase.firestore().collection("bookings").doc(bookingId);

    bookingRef.get().then((bookingDoc) => {
        if (!bookingDoc.exists) {
            console.warn(`No booking found for bookingId: ${bookingId}`);
            alert(`No booking found for Booking ID: ${bookingId}`);
            return;
        }

        const bookingData = bookingDoc.data();
        const paymentId = bookingData.paymentId;

        if (!paymentId) {
            console.warn(`No paymentId found for bookingId: ${bookingId}`);
            alert(`No payment associated with Booking ID: ${bookingId}`);
            return;
        }

        const paymentRef = firebase.firestore().collection("payments").doc(paymentId);

        // Update Firestore to mark the payment as verified
        bookingRef.update({ paymentStatus: "success" })
            .then(() => paymentRef.update({ status: "success" }))
            .then(() => alert(`Payment Verified for Booking ID: ${bookingId}`))
            .catch((error) => console.error("Error verifying payment:", error));
    }).catch((error) => {
        console.error("Error fetching booking details:", error);
    });
}

function showRejectDialog(bookingId) {
    const modal = document.createElement("div");
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <h2>Reject Payment</h2>
                <p>Are you sure you want to reject payment for Booking ID: <strong>${bookingId}</strong>?</p>
                <button id="confirmReject" class="btn-reject">Reject</button>
                <button id="cancelReject" class="btn-cancel">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);

    document.getElementById("confirmReject").addEventListener("click", function () {
        rejectPayment(bookingId);
        document.body.removeChild(modal);
    });

    document.getElementById("cancelReject").addEventListener("click", function () {
        document.body.removeChild(modal);
    });
}

function rejectPayment(bookingId) {
    const bookingRef = firebase.firestore().collection("bookings").doc(bookingId);

    bookingRef.get().then((bookingDoc) => {
        if (!bookingDoc.exists) {
            alert(`No booking found for Booking ID: ${bookingId}`);
            return;
        }

        const bookingData = bookingDoc.data();
        const paymentId = bookingData.paymentId;

        if (!paymentId) {
            alert(`No payment associated with Booking ID: ${bookingId}`);
            return;
        }

        const paymentRef = firebase.firestore().collection("payments").doc(paymentId);

        // Update both booking and payment status
        bookingRef.update({ paymentStatus: "rejected" })
            .then(() => paymentRef.update({ status: "rejected" }))
            .then(() => alert(`Payment Rejected for Booking ID: ${bookingId}`))
            .catch((error) => console.error("Error rejecting payment:", error));
    }).catch((error) => {
        console.error("Error fetching booking:", error);
    });
}

// Function to check payment details (like image URL and amount)
function checkPaymentDetails(bookingId) {
    const bookingRef = firebase.firestore().collection("bookings").doc(bookingId);

    bookingRef.get().then((bookingDoc) => {
        if (!bookingDoc.exists) {
            console.warn(`No booking found for bookingId: ${bookingId}`);
            alert(`No booking found for Booking ID: ${bookingId}`);
            return;
        }

        const bookingData = bookingDoc.data();
        const paymentId = bookingData.paymentId;

        if (!paymentId) {
            console.warn(`No paymentId found for bookingId: ${bookingId}`);
            alert(`No payment associated with Booking ID: ${bookingId}`);
            return;
        }

        const paymentRef = firebase.firestore().collection("payments").doc(paymentId);
        paymentRef.get().then((paymentDoc) => {
            const detailsCell = document.getElementById(`payment-details-${bookingId}`);

            if (!detailsCell) {
                console.error(`Error: Element #payment-details-${bookingId} not found.`);
                return;
            }

            if (paymentDoc.exists) {
                const paymentData = paymentDoc.data();
                console.log("Payment Data:", paymentData); // Debugging

                const imageBill = paymentData.imageBill || "";
                const amount = paymentData.amount || "Amount not specified";

                if (!imageBill) {
                    detailsCell.innerHTML = `<p>No image available</p>`;
                } else {
                    detailsCell.innerHTML = `
                        <div>
                            <img src="${imageBill}" alt="Payment Image" style="width: 100px; height: 100px;" class="payment-image"/>
                            <p>Amount: ${amount} Kip</p>
                        </div>
                    `;

                    // Add click event to zoom image
                    const imageElement = detailsCell.querySelector(".payment-image");
                    imageElement.addEventListener("click", function () {
                        zoomImage(imageBill);
                    });
                }
            } else {
                detailsCell.innerHTML = `<p>No payment details available</p>`;
                console.warn(`No document found for paymentId: ${paymentId}`);
            }
        }).catch((error) => {
            console.error("Error fetching payment details:", error);
        });
    }).catch((error) => {
        console.error("Error fetching booking details:", error);
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
