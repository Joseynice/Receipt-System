const multer = require('multer');  
const path = require('path');  
const fs = require('fs');  

// Define storage for company logos  
const storage = multer.diskStorage({  
    destination: function (req, file, cb) {  
        const uploadDir = path.join(__dirname, '../uploads');  
        
        // Ensure the directory exists  
        if (!fs.existsSync(uploadDir)) {  
            fs.mkdirSync(uploadDir, { recursive: true });  
        }  

        cb(null, uploadDir);  
    },  
    filename: function (req, file, cb) {  
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);  
        cb(null, "logo-" + uniqueSuffix + path.extname(file.originalname));  
    }  
});  

// Filter to allow only images  
const fileFilter = (req, file, cb) => {  
    const fileTypes = /jpeg|jpg|png|gif/;  
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());  
    const mimeType = fileTypes.test(file.mimetype);  

    if (extName && mimeType) {  
        cb(null, true);  
    } else {  
        cb(new Error(`Only image files (jpeg, jpg, png, gif) are allowed! You attempted to upload: ${file.originalname}`));  
    }  
};  

// Configure multer  
const upload = multer({  
    storage: storage,  
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit  
    fileFilter: fileFilter  
});  

module.exports = upload;