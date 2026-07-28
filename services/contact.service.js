const ContactInfo = require('../models/contactInfo.model');

function getBusinessContactInfo() {
  return new ContactInfo({
    instagram: 'rotiseria_elbuensabor._',
    whatsapp: '3533-514960'
  });
}

module.exports = {
  getBusinessContactInfo
};
