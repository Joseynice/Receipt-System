const fs = require('fs');  
const path = require('path');  
const PDFDocument = require('pdfkit');  

function generatePDF(receipt) {  
    const pdfDir = path.join(__dirname, '../receipts');  
    const pdfPath = path.join(pdfDir, `receipt-${receipt._id}.pdf`);  

    try {  
        // Create the receipts directory if it doesn't exist  
        if (!fs.existsSync(pdfDir)) {  
            fs.mkdirSync(pdfDir, { recursive: true });  
        }  

        const doc = new PDFDocument({ size: "A4", margin: 50 });  

        // Use the output path correctly  
        doc.pipe(fs.createWriteStream(pdfPath));  

        generateHeader(doc, receipt);  
        generateCustomerInformation(doc, receipt);  
        generateInvoiceTable(doc, receipt);  
        generateFooter(doc);  

        doc.end();  
        return pdfPath;  // Return the path to the created PDF  
    } catch (error) {  
        console.error("Error generating PDF:", error);  
        throw new Error('Failed to generate PDF'); // rethrow the error after logging  
    }  
}  

function generateHeader(doc, receipt) {  
    try {  
        if (receipt.company.logo) {  
            doc.image(path.join(__dirname, `../uploads/${receipt.company.logo}`), 50, 45, { width: 50 })  
                .fillColor("#444444")  
                .fontSize(20)  
                .text(receipt.company.name || 'Company Name', 110, 57, { bold: true })  
                .fontSize(10)  
                .text(receipt.company.phone, 200, 65, { align: "right" })  
                .text(receipt.company.address, 200, 80, { align: "right" })  
                .moveDown();  
        }  
    } catch (error) {  
        console.error("Error generating header:", error);  
    }  
}  

function generateCustomerInformation(doc, receipt) {  
    try {  
        doc.fillColor("#444444").fontSize(20).text("Invoice", 50, 160);  
        generateHr(doc, 185);  
        
        const customerInformationTop = 200;  

        doc.fontSize(10)  
            .text("Name:", 50, customerInformationTop)  
            .font("Helvetica-Bold")  
            .text(receipt.receiver.name || 'N/A', 150, customerInformationTop)  
            .font("Helvetica")  
            .text("Phone:", 50, customerInformationTop + 15)  
            .text(receipt.receiver.phone || 'N/A', 150, customerInformationTop + 15)  
            .text("Address:", 50, customerInformationTop + 30)  
            .text(receipt.receiver.address || 'N/A', 150, customerInformationTop + 30)  
            .moveDown();  

        generateHr(doc, 252);  
    } catch (error) {  
        console.error("Error generating customer information:", error);  
    }  
}  

function generateInvoiceTable(doc, receipt) {  
    try {  
        const invoiceTableTop = 280;  
        doc.font("Helvetica-Bold");  
        generateTableRow(doc, invoiceTableTop, "Item", "Description", "Quantity", "Price", "Total");  
        generateHr(doc, invoiceTableTop + 20);  
        doc.font("Helvetica");  

        for (let i = 0; i < receipt.items.length; i++) {  
            const item = receipt.items[i];  
            const position = invoiceTableTop + (i + 1) * 30;  
            generateTableRow(  
                doc,  
                position,  
                item.name,  
                item.description || 'N/A',  
                item.quantity.toString(),  
                formatCurrency(item.price, receipt.company.currency),  
                formatCurrency(item.total, receipt.company.currency)  
            );  
            generateHr(doc, position + 20);  
        }  

        doc.fontSize(12)  
            .fillColor('#000000')  
            .text(`Subtotal: ${formatCurrency(receipt.total, receipt.company.currency)}`, { align: 'right' })  
            .text(`VAT (${receipt.vatRate}%): ${formatCurrency(receipt.vatAmount, receipt.company.currency)}`, { align: 'right' })  
            .fontSize(14)  
            .fillColor('#ff5733')  
            .text(`Grand Total: ${formatCurrency(receipt.grandTotal, receipt.company.currency)}`, { align: 'right', bold: true });  
    } catch (error) {  
        console.error("Error generating invoice table:", error);  
    }  
}  

function generateTableRow(doc, y, item, description, quantity, price, total) {  
    doc.fontSize(10)  
        .text(item, 50, y)  
        .text(description, 150, y)  
        .text(quantity, 280, y, { width: 90, align: "right" })  
        .text(price, 370, y, { width: 90, align: "right" })  
        .text(total, 0, y, { align: "right" });  
}  

function generateHr(doc, y) {  
    doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();  
}  

function generateFooter(doc) {  
    try {  
        doc.fontSize(10)  
            .text("Thank you for your business!", 50, 780, { align: "center", width: 500 });  
    } catch (error) {  
        console.error("Error generating footer:", error);  
    }  
}  

// Helper function to format currency values  
function formatCurrency(value, currency) {  
    return `${value.toFixed(2)} ${currency}`;  
}  

module.exports = {  
    generatePDF  
};