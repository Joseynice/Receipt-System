const express =require('express');
const router = express.Router();
const pageCont = require('../controller/pageCont')


//routes for different pages 
router.get('/receipt', pageCont.getreceiptPage);

module.exports = router;