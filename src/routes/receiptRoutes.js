const express = require("express");
const router = express.Router();
const receiptController = require("../controller/receiptCont");
const upload = require("../helpers/handleImage"); // Correct multer configuration
 
// ✅ Move Multer middleware to the route itself
router.post("/receipt", upload.single("companyLogo"), receiptController.addReceipt);

router.get("/receipt/download/:id", receiptController.downloadReceipt);



router.post('/receipt', (req, res) => {
    console.log("📥 Received items:", req.body.items); // Debugging
    
    let items;
    try {
        items = JSON.parse(req.body.items); // Ensure JSON parsing
    } catch (error) {
        return res.status(400).json({ message: "Invalid items format: JSON parsing error" });
    }

    if (!Array.isArray(items)) {
        return res.status(400).json({ message: "Invalid items format: Expected an array" });
    }

    console.log("✅ Parsed items:", items); // Check the final structure
    res.json({ message: "Receipt processed successfully!" });
});


module.exports = router;
