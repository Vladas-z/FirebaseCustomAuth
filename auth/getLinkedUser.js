const { firestore } = require('./admin')
const getFirebaseUser = require('./getFirebaseUser')

module.exports = async function getLinkedUser(provider, id) {
    if (!provider || provider === '' || !id || id === '') {
        return { error: true }
    }

    let providerProperty = ''
    switch (provider) {
        case 'vk.com':
            providerProperty = 'vkUUID'
            break
        case 'ok.ru':
            providerProperty = 'okUUID'
            break
        case 'instagram.com':
            providerProperty = 'instUUID'
            break
    }

    const dbUserIdRequest = await firestore
        .collection('users')
        .where(providerProperty, '==', id.toString())
        .get()
        .then(result => {
            if (result.size > 0) {
                return {
                    error: false,
                    userRecordId: result.docs[0].id,
                }
            }
            return {
                error: true,
            }
        })
    if (dbUserIdRequest.error) {
        return dbUserIdRequest
    }

    return getFirebaseUser(dbUserIdRequest.userRecordId)
}
