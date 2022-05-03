const { admin, firestore } = require('./admin')
const getFirebaseUser = require('./getFirebaseUser')
const getFirebaseUserByPhone = require('./getFirebaseUserByPhone')
const getLinkedUser = require('./getLinkedUser')

module.exports = async function getOrCreateUserAccount(
    uid,
    provider = '',
    id = '',
    phone = ''
) {
    const userRecordRequest = provider === 'phone' ? await getFirebaseUserByPhone(phone) : await getFirebaseUser(uid)

    if (!userRecordRequest.error) {
        return userRecordRequest
    }

    const linkedUserRecordRequest = await getLinkedUser(provider, id)
    if (!linkedUserRecordRequest.error) {
        return linkedUserRecordRequest
    }

    const keyMap = {
        'phone': 'phone'
    }

    const createUserParams = provider === 'phone' ? {phoneNumber: phone} : { uid }

    return await admin
        .auth()
        .createUser(createUserParams)
        .then(userRecord => {
            const key = keyMap[provider]
            if (key !== undefined) {
                firestore.doc(`users/${userRecord.uid}`).set({ [key]: userRecord.uid }, { merge: true })
            }

            return { error: false, userRecord }
        })
        .catch(error => {
            return { error: true, message: error.message }
        })
}