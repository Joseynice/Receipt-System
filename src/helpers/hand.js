const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Function to generate a PDF receipt
const generatePDF = (receipt) => {
    // Define the directory for saving PDF files
    const pdfDir = path.join(__dirname, '../receipts');
    if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
    }

    // Define the PDF file path
    const pdfPath = path.join(pdfDir, `receipt-${receipt._id}.pdf`);
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    // Stream the document to a file
    doc.pipe(fs.createWriteStream(pdfPath));

    // **Company Logo & Details**
    if (receipt.company.logo) {
        doc.image(path.join(__dirname, `../uploads${receipt.company.logo}`), 50, 30, { width: 100 });
    }

    doc
        .fontSize(20)
        .fillColor('#333333')
        .text(receipt.company.name || 'Company Name', 160, 30, { bold: true })
        .fontSize(10)
        .fillColor('#555555')
        .text(receipt.company.email || '', 160, 50)
        .text(receipt.company.phone || '', 160, 65)
        .text(receipt.company.currency ? `Currency: ${receipt.company.currency}` : '', 160, 80)
        .moveDown(2);

    // **Invoice Title**
    doc
        .fontSize(26)
        .fillColor('#000000')
        .text('INVOICE', { align: 'right', bold: true })
        .moveDown(1);

    // **Date**
    doc
        .fontSize(12)
        .fillColor('#333333')
        .text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' })
        .moveDown(1);

    // **Receiver Details**
    doc
        .fontSize(14)
        .fillColor('#000000')
        .text('Bill To:', 50, doc.y, { bold: true, underline: true })
        .moveDown()
        .fontSize(12)
        .fillColor('#444444')
        .text(`Name: ${receipt.receiver.name}`)
        .text(`Phone: ${receipt.receiver.phone}`)
        .text(`Email: ${receipt.receiver.email}`)
        .text(`Address: ${receipt.receiver.address}`)
        .moveDown(2);

    // **Table Header**
    const tableTop = doc.y;
    const columnWidths = [200, 100, 100, 100];
    const startX = 50;
    
    doc
        .fontSize(12)
        .fillColor('#000000')
        .text('Item', startX, tableTop, { bold: true })
        .text('Qty', startX + columnWidths[0], tableTop, { bold: true })
        .text('Price', startX + columnWidths[0] + columnWidths[1], tableTop, { bold: true })
        .text('Total', startX + columnWidths[0] + columnWidths[1] + columnWidths[2], tableTop, { bold: true });

    doc.moveDown(0.5);

    // **Add Items in a Table Format**
    doc.lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke(); // Table border

    receipt.items.forEach(item => {
        const itemY = doc.y;
        doc
            .fillColor('#333333')
            .text(item.name, startX, itemY, { width: columnWidths[0], align: 'left' })
            .text(item.quantity.toString(), startX + columnWidths[0], itemY, { width: columnWidths[1], align: 'center' })
            .text(`${item.price} ${receipt.company.currency}`, startX + columnWidths[0] + columnWidths[1], itemY, { width: columnWidths[2], align: 'right' })
            .text(`${item.total} ${receipt.company.currency}`, startX + columnWidths[0] + columnWidths[1] + columnWidths[2], itemY, { width: columnWidths[3], align: 'right' });
        doc.moveDown();
    });

    // Divider Line
    doc
        .moveDown()
        .strokeColor("#aaaaaa")
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown();

    // **Totals Section**
    doc
        .fontSize(12)
        .fillColor('#000000')
        .text(`Subtotal: ${receipt.total.toFixed(2)} ${receipt.company.currency}`, { align: 'right' })
        .text(`VAT (7.5%): ${receipt.vatAmount.toFixed(2)} ${receipt.company.currency}`, { align: 'right' })
        .fontSize(14)
        .fillColor('#ff5733')
        .text(`Grand Total: ${receipt.grandTotal.toFixed(2)} ${receipt.company.currency}`, { align: 'right', bold: true });

    // **Footer**
    doc
        .moveDown(2)
        .fontSize(10)
        .fillColor("#555555")
        .text("Thank you for your business!", { align: "center" })
        .moveDown(0.5)
        .text("For inquiries, contact us at: " + receipt.company.email, { align: "center" });

    doc.end();

    console.log(`PDF Created: ${pdfPath}`);
    return `/receipts/receipt-${receipt._id}.pdf`;
};

module.exports = { generatePDF };
