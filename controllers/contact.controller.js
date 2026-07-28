const contactService = require('../services/contact.service');

function getContactInfo(req, res) {
  const contactInfo = contactService.getBusinessContactInfo();
  res.status(200).json({
    ok: true,
    data: contactInfo
  });
}

module.exports = {
  getContactInfo
};
