const mongoose = require('mongoose');

//validation middleware 
const validateObjectId = (req, res, next) => {
  const id = req.params.id;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }
  
  next();
};

module.exports = { validateObjectId };