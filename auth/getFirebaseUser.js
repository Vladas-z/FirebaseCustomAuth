const { admin } = require('./admin')

module.exports = function getFirebaseUser(uid) {
    return admin
        .auth()
        .getUser(uid)
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
