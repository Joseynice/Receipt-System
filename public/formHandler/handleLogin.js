// Global variable to track item index
let itemIndex = 0;

// Function to add a new item row
function addItem() {
    const container = document.getElementById("itemsContainer");

    const newItem = document.createElement("div");
    newItem.classList.add("form-row", "item-row");

    newItem.innerHTML = `  
        <input type="text" class="item-name" name="items[${itemIndex}][name]" placeholder="Item Name" required>  
        <input type="text" class="item-description" name="items[${itemIndex}][description]" placeholder="Description">  
        <input type="number" class="item-qty" name="items[${itemIndex}][quantity]" placeholder="Quantity" required oninput="updateTotal(this)">  
        <input type="number" class="item-price" name="items[${itemIndex}][price]" placeholder="Price" required oninput="updateTotal(this)">  
        <input type="number" class="item-total" name="items[${itemIndex}][total]" placeholder="Total" readonly>  
        <button type="button" class="remove" onclick="removeItem(this)">❌</button>  
    `;

    container.appendChild(newItem);
    itemIndex++;
}

// Function to remove an item row
function removeItem(button) {
    button.parentElement.remove();
}

// Function to update total price
function updateTotal(input) {
    const itemContainer = input.closest(".item-row");
    const qty = itemContainer.querySelector(".item-qty").value;
    const price = itemContainer.querySelector(".item-price").value;
    const totalField = itemContainer.querySelector(".item-total");

    totalField.value = qty && price ? (parseFloat(qty) * parseFloat(price)).toFixed(2) : "";
}

async function generateReceipt() {
    console.log("Button clicked, generating receipt...");

    const form = document.getElementById("receiptForm");
    const previewDiv = document.getElementById("receiptPreview");
    const submitBtn = form.querySelector("button[type='button']");
    submitBtn.disabled = true;

    // Collect form data using FormData API
    const formData = new FormData(form);

    // Remove existing "items" fields collected by FormData to avoid duplicates
    formData.delete("items");

    // Add items manually (because FormData doesn't auto-detect dynamically created inputs)
    let items = [];
    document.querySelectorAll(".item-row").forEach((row) => {
        const itemName = row.querySelector(".item-name").value;
        const itemDescription = row.querySelector(".item-description").value;
        const itemQty = row.querySelector(".item-qty").value;
        const itemPrice = row.querySelector(".item-price").value;
        const itemTotal = row.querySelector(".item-total").value;

        if (itemName && itemQty && itemPrice) {
            items.push({
                name: itemName,
                description: itemDescription,
                quantity: parseFloat(itemQty), // ✅ Fix: use "quantity"
                price: parseFloat(itemPrice),
                total: parseFloat(itemTotal),
            });
        }
    });

    if (items.length === 0) {
        alert("Please add at least one item!");
        submitBtn.disabled = false;
        return;
    }

    // Convert items array to JSON and append to formData
    formData.append("items", JSON.stringify(items)); // ✅ Append correctly formatted JSON

    console.log("🚀 Debug: Sending items:", JSON.stringify(items, null, 2)); 
console.log("🚀 Debug: FormData items:", formData.get("items")); 


    try {
        const response = await fetch("/receipt", {
            method: "POST",
            body: formData, // Sending formData (including file uploads)
        });

        // 🔹 Check if response is HTML (error page)
        const contentType = response.headers.get("content-type");
        if (!response.ok) {
            if (contentType && contentType.includes("application/json")) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to generate receipt.");
            } else {
                const errorText = await response.text();
                throw new Error(`Server Error: ${errorText}`);
            }
        }

        // 🔹 Check if response is a PDF (blob)
        if (contentType && contentType.includes("application/pdf")) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "receipt.pdf";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            console.error("Unexpected response type:", contentType);
            throw new Error("Unexpected response type from server.");
        }

        // 🔥 Show receipt preview
        previewDiv.innerHTML = generatePreviewHTML(formData, items);
        previewDiv.style.display = "block"; // Show preview

    } catch (error) {
        console.error("Error:", error.message);
        alert(error.message);
    } finally {
        submitBtn.disabled = false;
    }
}



// 🔹 Function to generate preview HTML
function generatePreviewHTML(formData, items) {
    let previewContent = `<h2>Receipt Preview</h2>
        <p><strong>Company:</strong> ${formData.get("companyName")}</p>
        <p><strong>Receiver:</strong> ${formData.get("receiverName")}</p>
        <table border="1">
            <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
            </tr>`;

    items.forEach(item => {
        previewContent += `
            <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>${item.price}</td>
                <td>${item.total}</td>
            </tr>`;
    });

    previewContent += `</table><button onclick="closePreview()">Close Preview</button>`;
    return previewContent;
}

// 🔹 Close preview function
function closePreview() {
    document.getElementById("receiptPreview").style.display = "none";
}

// Make sure `generateReceipt()` is globally accessible
window.generateReceipt = generateReceipt;
window.closePreview = closePreview;

// Reset form
function resetForm() {
    document.getElementById("receiptForm").reset();
    document.getElementById("itemsContainer").innerHTML = "";
    itemIndex = 0;
}

// Preview receipt modal
// function previewReceipt() { 
//     let previewContent = "<h2>Receipt Preview</h2><ul>";
//     new FormData(document.getElementById("receiptForm")).forEach((value, key) => {
//         previewContent += `<li><strong>${key}:</strong> ${value}</li>`;
//     });
//     previewContent += "</ul>";

//     // Create modal
//     const previewModal = document.createElement("div");
//     previewModal.classList.add("modal");
//     previewModal.innerHTML = `
//         <div class="modal-content">
//             ${previewContent}
//             <button class="close-modal">Close</button>
//         </div>
//     `;   

//     // Close button event
//     previewModal.querySelector(".close-modal").addEventListener("click", function () {
//         previewModal.remove();
//     });

//     document.body.appendChild(previewModal);
// }

// Ensure script executes after DOM loads
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("receiptForm");

    // Handle form submission
    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        await generateReceipt();
    });

    // Add preview button
    const previewBtn = document.createElement("button");
    previewBtn.textContent = "Preview Receipt";
    previewBtn.type = "button";
    previewBtn.addEventListener("click", previewReceipt);
    form.appendChild(previewBtn);
});
