
// TODO Получаем экземляр firebase-admin
const { admin } = require('./admin')

module.exports = async function createResponce(
    userAccountRequest,
    authResult,
    provider = '',
    id = '',
    responce
) {
    if (!userAccountRequest.error) {
        authResult.status(200).send(
            JSON.stringify(
                await admin
                    .auth()
                    .createCustomToken(userAccountRequest.userRecord.uid)
                    .then(token => ({
                        data: {
                            error: false,
                            token,
                            firebaseUID: userAccountRequest.userRecord.uid,
                            id,
                            provider,
                        },
                    }))
                    .catch(error => ({
                        data: { error: true, message: error.message, responce },
                    }))
            )
        )
    } else {
        authResult
            .status(500)
            .send(JSON.stringify({ data: userAccountRequest }))
    }
}
