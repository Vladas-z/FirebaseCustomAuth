const functions = require('firebase-functions');

const smsApiId = functions.config().smsapiid && functions.config().smsapiid.id

const request = require('request-promise')

exports.sendSMSToken = (phone, messageText) => request({
  uri: `http://sms.ru/sms/send?api_id=${smsApiId}&to=${phone}&text=${messageText}`,
})