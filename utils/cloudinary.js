const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'df8fulsuk',
    api_key: '542312764192651',
    api_secret: 'XqXhbf_Z9HTSrmG-ZChicJ_jFUk'
  });

module.exports = cloudinary;