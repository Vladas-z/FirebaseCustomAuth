const { admin } = require('./admin')

module.exports = function getFirebaseUserByPhone(phone) {
    return admin
        .auth()
        .getUserByPhoneNumber(phone)
        .then(userRecord => {
            if (userRecord) {
                return { error: false, userRecord }
            } else {
                return { error: true }
            }
        })
        .catch(error => {
            return { error: true, message: error.message }
        })
}
