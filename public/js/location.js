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

    const updateFormContainer = document.createElement("div");
    updateFormContainer.id = "update-parking-form";
    updateFormContainer.style.display = "none";
    updateFormContainer.style.marginTop = "20px";
    updateFormContainer.innerHTML = `
        <h3>Update Parking Info</h3>
        <input type="text" id="update-nameparking" placeholder="Parking Name"><br><br>
        <input type="text" id="update-address" placeholder="Address"><br><br>
        <textarea id="update-description" placeholder="Description"></textarea><br><br>
        <input type="number" id="update-car-slot" placeholder="Car Slot"><br><br>
        <input type="text" id="update-image-url" placeholder="Image URL"><br><br>
        <button id="submit-update">Submit</button>
        <button id="cancel-update">Cancel</button>
        <hr>
    `;
    document.querySelector("#parking-data").appendChild(updateFormContainer);

    const nameInput = document.getElementById("update-nameparking");
    const addressInput = document.getElementById("update-address");
    const descInput = document.getElementById("update-description");
    const carSlotInput = document.getElementById("update-car-slot");
    const imageUrlInput = document.getElementById("update-image-url");
    const submitUpdate = document.getElementById("submit-update");
    const cancelUpdate = document.getElementById("cancel-update");

    let selectedParkingId = null;

    cancelUpdate.addEventListener("click", () => {
        updateFormContainer.style.display = "none";
        selectedParkingId = null;
    });

    submitUpdate.addEventListener("click", () => {
        if (selectedParkingId) {
            db.collection("parking").doc(selectedParkingId).update({
                nameparking: nameInput.value,
                address: addressInput.value,
                description: descInput.value,
                car_slot: parseInt(carSlotInput.value),
                imageUrl: imageUrlInput.value
            }).then(() => {
                alert("Parking info updated!");
                updateFormContainer.style.display = "none";
                selectedParkingId = null;
            }).catch((error) => {
                console.error("Error updating parking:", error);
            });
        }
    });

    db.collection("parking").onSnapshot((querySnapshot) => {
        tableBody.innerHTML = "";

        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${userData.nameparking || "N/A"}</td>
                <td>${userData.address || "N/A"}</td>
                <td>${userData.description || "N/A"}</td>
                <td>${userData.car_slot || "N/A"}</td>
                <td>
                    <img src="${userData.imageUrl || ""}" alt="User Image" class="image-zoom" style="width: 100px; height: 100px; cursor: pointer;">
                </td>
                <td>
                    <button class="update-btn"
                        data-id="${doc.id}"
                        data-name="${userData.nameparking || ""}"
                        data-address="${userData.address || ""}"
                        data-description="${userData.description || ""}"
                        data-slot="${userData.car_slot || ""}"
                        data-image="${userData.imageUrl || ""}">
                        Update
                    </button>
                    <button class="delete-btn" data-id="${doc.id}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Image zoom modal
        var modal = document.getElementById("zoomModal");
        var modalImg = document.getElementById("zoomedImage");
        var captionText = document.getElementById("caption");
        var closeBtn = document.getElementById("closeZoomModal");
        var nav = document.querySelector("nav");

        document.querySelectorAll(".image-zoom").forEach((img) => {
            img.onclick = function () {
                modal.style.display = "block";
                modalImg.src = this.src;
                captionText.innerHTML = this.alt || "Image";
                nav.style.display = "none";
            };
        });

        closeBtn.onclick = function () {
            modal.style.display = "none";
            nav.style.display = "flex";
        };

        modal.onclick = function (e) {
            if (e.target === modal) {
                modal.style.display = "none";
                nav.style.display = "flex";
            }
        };

        // Delete
        document.querySelectorAll(".delete-btn").forEach((button) => {
            button.addEventListener("click", (e) => {
                const parkingId = e.target.getAttribute("data-id");
                if (confirm("Are you sure you want to delete this parking location?")) {
                    db.collection("parking").doc(parkingId).delete()
                        .then(() => alert("Parking deleted successfully!"))
                        .catch((error) => console.error("Error deleting parking:", error));
                }
            });
        });

        // Update
        document.querySelectorAll(".update-btn").forEach((button) => {
            button.addEventListener("click", () => {
                selectedParkingId = button.getAttribute("data-id");
                nameInput.value = button.getAttribute("data-name");
                addressInput.value = button.getAttribute("data-address");
                descInput.value = button.getAttribute("data-description");
                carSlotInput.value = button.getAttribute("data-slot");
                imageUrlInput.value = button.getAttribute("data-image");
                updateFormContainer.style.display = "block";
            });
        });
    });
});

