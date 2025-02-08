const Receipt = require('../models/receiptModel');
const fs = require('fs');
const path = require('path');
const upload = require('../helpers/handleImage');
const { generatePDF } = require('../helpers/handlePdf');

module.exports = {
    addReceipt: async (req, res) => {
        try {
            console.log("Incoming Request Body:", req.body);
            console.log("Uploaded File:", req.file);
    
            if (!req.file) {
                return res.status(400).json({ error: "File upload is required!" });
            }
    
            // Validate Required Fields
            if (!req.body.companyName || !req.body.receiverName) {
                return res.status(400).json({ message: "Company name and receiver name are required." });
            }
             // Process Items from JSON String
             let items = [];
             if (req.body.items) {
                 try {
                     items = JSON.parse(req.body.items);
                 } catch (error) {
                     return res.status(400).json({ message: "Invalid items format" });
                 }
             }
     
             if (items.length === 0) {
                 return res.status(400).json({ message: "No items received" });
             }
     
    
            // Company Data
            const companyData = {
                name: req.body.companyName,
                email: req.body.companyEmail || '',
                phone: req.body.companyPhone || '',
                address: req.body.companyAddress || '',
                currency: req.body.companyCurrency || 'Dollar ($)',
                logo: req.file.path, // ✅ Store the correct file path
            };
    
            // Receiver Data
            const receiver = {
                name: req.body.receiverName,
                phone: req.body.receiverPhone || '',
                email: req.body.receiverEmail || '',
                address: req.body.receiverAddress || '',
            };
    
           
            let total = items.reduce((sum, item) => sum + (item.total || 0), 0);
            let vatRate = parseFloat(req.body.vatRate) || 7.5;
            const vatAmount = (total * vatRate) / 100;
            const grandTotal = total + vatAmount;
    
            // Save Receipt to Database
            const newReceipt = new Receipt({
                company: companyData,
                receiver,
                items,
                total,
                vatAmount,
                grandTotal,
            });
    
            await newReceipt.save();
    
            // Generate PDF
            const pdfPath = path.join(__dirname, `../receipts/receipt-${newReceipt._id}.pdf`);
            await generatePDF(newReceipt, pdfPath);
    
            res.status(201).json({
                message: "Receipt added successfully!",
                receipt: newReceipt,
                pdfPath,
            });
        } catch (error) {
            console.error("Error adding receipt:", error);
            res.status(500).json({ message: "Failed to add receipt", error: error.message });
        }
    },


    downloadReceipt: async (req, res) => {
        const { id } = req.params;

        try {
            const receipt = await Receipt.findById(id);
            if (!receipt) {
                return res.status(404).json({ message: ' Receipt not found' });
            }

            const filePath = path.join(__dirname, `../receipts/receipt-${id}.pdf`);

            if (fs.existsSync(filePath)) {
                res.download(filePath, `receipt-${id}.pdf`, (err) => {
                    if (err) {
                        console.error("Download error:", err);
                        res.status(500).json({ message: 'Error while downloading the file' });
                    }
                });
            } else {
                res.status(404).json({ message: ' PDF file not found' });
            }
        } catch (error) {
            console.error("Error in downloadReceipt:", error);
            res.status(500).json({ message: 'Failed to download receipt', error: error.message });
        }
    }
};
