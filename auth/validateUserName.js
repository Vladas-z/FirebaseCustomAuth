const functions = require('firebase-functions')
const admin = require('firebase-admin');
const { firestore } = require('../services')

const validateUserName = async (req, res) => {
    try {
        let requestBody = req.body.data
        let name = requestBody.name
        var userCollections = (await firestore.collection("users").where('name', '==', name).get()).docs;
        if (userCollections.length===0) {
            res.status(200).send("");
        } else {
            res.status(400).send("");
        }
    } catch (error) {
        console.log(error.stack)
        res.status(500).send(error);
    }
}

module.exports = functions.https.onRequest(validateUserName)