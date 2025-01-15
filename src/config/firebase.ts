
import * as admin from 'firebase-admin';

const serviceKeys = require("../../firebase-service-account.json")

admin.initializeApp({
    credential: admin.credential.cert(serviceKeys as admin.ServiceAccount),
});

export default admin;
