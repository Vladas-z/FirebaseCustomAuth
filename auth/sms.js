
const functions = require('firebase-functions')
const moment = require('moment')


const getOrCreateUserAccount = require('./getOrCreateUserAccount')
const createResponce = require('./createResponce')

const { sendSMSToken } = require('./services/getToken')

const normalizePhone = (phone) => {
    return phone.replace(/[^0-9+]/g, '').trim()
}

const getExistCode = (phone) => {
    const codeRef = firestore.doc(`codes/${phone}`)

    const code = codeRef
        .get()
        .then((doc) => (doc.exists ? doc.data() : null))
        .catch((err) => {
            throw new Error('Ошибка получения нового кода')
        })

    return code
}

const createNewCode = async (phone) => { 

    const existCode = await getExistCode(phone)

    if (existCode && (existCode.expireDate.toDate() > new Date())) {
        throw new Error(`Новый код можно будет получить ${existCode.expireDate.toDate()}`)
    }

    const codeLength = 6

    const codeRef = firestore.doc(`codes/${phone}`)
    const code = `000000${Math.floor(Math.random() * Math.pow(10, codeLength))}`.slice(-codeLength)
    const expireDate = moment(new Date()).add(1, 'minutes').toDate()
    await codeRef.set({ code, expireDate })

    return code
}

const smsAuthRequest = async (authRequest, authResult) => {
    const { phone } = authRequest.body.data

    const normalizedPhone = normalizePhone(phone)

    let newCode = undefined

    try {
        newCode = await createNewCode(normalizedPhone)
    } catch (error) {
        console.error(error)
        authResult.status(500).send(JSON.stringify({ error: true, message: error.message }))
        return;
    }

    const messageText = `Code: ${newCode}`

    const { status, ...message } = await sendSMSToken(normalizedPhone, messageText)
        .then((response) => {
            if (response.slice(0, 3) !== '100')
                throw new Error('Ошибка отправки СМС')
            return { error: false, message: 'СМС отправлена', status: 200 }
        })
        .catch(error => ({ error: true, message: 'Ошибка отправки СМС', status: 500 }))

    return authResult.status(status).send(JSON.stringify(message))
}

const smsAuthValidate = async (authRequest, authResult) => {
    const { phone, code } = authRequest.body.data

    const normalizedPhone = normalizePhone(phone)

    const existingCode = await getExistCode(normalizedPhone)

    const provider = 'phone'

    if (!existingCode || existingCode.code !== code) {
        console.error('Existing code doesnt match')
        authResult.status(500).send(JSON.stringify({ error: true, message: 'Код не совпадает или не отправлен' }))
        return;
    }

    const userAccountRequest = await getOrCreateUserAccount(
        undefined,
        provider,
        undefined,
        normalizedPhone
    )

    if (userAccountRequest.error) {
        console.error(userAccountRequest.message)
        authResult.status(500).send(JSON.stringify({ error: true, message: 'Ошибка авторизации' }))
        return;
    }

    createResponce(
        userAccountRequest,
        authResult,
        provider,
        userAccountRequest.userRecord.uid,
        ''
    )
}

module.exports.smsAuthRequest = functions.https.onRequest(smsAuthRequest)
module.exports.smsAuthValidate = functions.https.onRequest(smsAuthValidate)