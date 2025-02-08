document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("receiptForm");
    const previewBtn = document.createElement("button");
    previewBtn.textContent = "Preview Receipt";
    previewBtn.type = "button";
    previewBtn.addEventListener("click", previewReceipt);
    form.appendChild(previewBtn);

    // Handle company logo preview
    document.getElementById("companyLogo").addEventListener("change", function (event) {
        const reader = new FileReader();
        reader.onload = function () {
            const logoPreview = document.getElementById("logoPreview");
            logoPreview.src = reader.result;
            logoPreview.style.display = "block";
        };
        reader.readAsDataURL(event.target.files[0]);
    });

    //Add Item
    let itemIndex = 1;

        function addItem() {
            const container = document.getElementById("itemsContainer");

            const newItem = document.createElement("div");
            newItem.classList.add("item");

            newItem.innerHTML = `
                <input type="text" name="items[${itemIndex}][name]" placeholder="Item Name" required>
                <input type="number" name="items[${itemIndex}][quantity]" class="qty" placeholder="Quantity" required oninput="updateTotal(this)">
                <input type="number" name="items[${itemIndex}][price]" class="price" placeholder="Price" required oninput="updateTotal(this)">
                <input type="number" name="items[${itemIndex}][total]" class="total" placeholder="Total" readonly>
                <button type="button" class="remove" onclick="removeItem(this)">❌ Remove</button>
            `;

            container.appendChild(newItem);
            itemIndex++;
        }

        function removeItem(button) {
            button.parentElement.remove();
        }

        function updateTotal(input) {
            const itemContainer = input.parentElement;
            const qty = itemContainer.querySelector(".qty").value;
            const price = itemContainer.querySelector(".price").value;
            const totalField = itemContainer.querySelector(".total");

            totalField.value = qty && price ? (qty * price).toFixed(2) : "";
        }

    // let itemIndex = 1;
    // document.getElementById("itemsContainer").addEventListener("click", function (event) {
    //     if (event.target.classList.contains("remove-item")) {
    //         event.target.parentElement.remove();
    //     }
    // });

    // document.getElementById("itemsContainer").addEventListener("input", function (event) {
    //     if (event.target.classList.contains("qty") || event.target.classList.contains("price")) {
    //         updateTotal(event.target);
    //     }
    // });

    // document.getElementById("addItemBtn").addEventListener("click", function () {
    //     addItem();
    // });

    // function addItem() {
    //     const container = document.getElementById("itemsContainer");
    //     const newItem = document.createElement("div");
    //     newItem.classList.add("item");
    //     newItem.innerHTML = `
    //         <input type="text" name="items[${itemIndex}][name]" placeholder="Item Name" required>
    //         <input type="number" name="items[${itemIndex}][quantity]" class="qty" placeholder="Quantity" required>
    //         <input type="number" name="items[${itemIndex}][price]" class="price" placeholder="Price" required>
    //         <input type="number" name="items[${itemIndex}][total]" class="total" placeholder="Total" readonly>
    //         <button type="button" class="remove-item">❌</button>
    //     `;
    //     container.appendChild(newItem);
    //     itemIndex++;
    // }

    // function updateTotal(input) {
    //     const itemContainer = input.parentElement;
    //     const qty = itemContainer.querySelector(".qty").value;
    //     const price = itemContainer.querySelector(".price").value;
    //     const totalField = itemContainer.querySelector(".total");
    //     totalField.value = qty && price ? (qty * price).toFixed(2) : "";
    // }

    function previewReceipt() {
        const formData = new FormData(form);
        let previewContent = "<h2>Receipt Preview</h2><ul>";
        formData.forEach((value, key) => {
            previewContent += `<li><strong>${key}:</strong> ${value}</li>`;
        });
        previewContent += "</ul>";

        const previewModal = document.createElement("div");
        previewModal.innerHTML = `
            <div class="modal">
                <div class="modal-content">
                    ${previewContent}
                    <button onclick="this.parentElement.parentElement.remove()">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(previewModal);
    }
});
