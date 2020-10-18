"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaddleService = void 0;
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const const_1 = require("../const");
const Serialize = require('php-serialize');
const ksort = (obj) => {
    const keys = Object.keys(obj).sort();
    let sortedObj = {};
    for (let i in keys) {
        sortedObj[keys[i]] = obj[keys[i]];
    }
    return sortedObj;
};
class PaddleService {
    constructor() {
        this.publicKey = null;
    }
    loadPublicKey() {
        try {
            service.publicKey = fs_1.default.readFileSync(strapi.config.plugins[`strapi-plugin-${const_1.PLUGINS.PADDLE_WEBHOOK}`].publicKeyPath).toString('utf8');
            strapi.log.debug('paddle public key loaded', {
                path: strapi.config.plugins[`strapi-plugin-${const_1.PLUGINS.PADDLE_WEBHOOK}`].publicKeyPath
            });
        }
        catch (e) {
            strapi.log.error('paddle public key load filed', {
                path: strapi.config.plugins[`strapi-plugin-${const_1.PLUGINS.PADDLE_WEBHOOK}`].publicKeyPath,
                e: e
            });
            throw new Error(e);
        }
    }
    async afterVerified(_payload) {
        return true;
    }
    async addOrder(jsonObj) {
        try {
            const mySig = Buffer.from(jsonObj.p_signature, 'base64');
            delete jsonObj.p_signature;
            jsonObj = ksort(jsonObj);
            for (let property in jsonObj) {
                if (jsonObj.hasOwnProperty(property) && (typeof jsonObj[property]) !== 'string') {
                    if (Array.isArray(jsonObj[property])) {
                        jsonObj[property] = jsonObj[property].toString();
                    }
                    else {
                        jsonObj[property] = JSON.stringify(jsonObj[property]);
                    }
                }
            }
            const serialized = Serialize.serialize(jsonObj);
            const verifier = crypto_1.default.createVerify('sha1');
            verifier.update(serialized);
            verifier.end();
            const verification = verifier.verify(service.publicKey, mySig);
            if (verification) {
                strapi.log.debug('paddle order signature verified', {});
                const saveOrder = await service.afterVerified(jsonObj);
                if (saveOrder) {
                    const order = {};
                    if (jsonObj.email) {
                        order.user = await strapi.query(const_1.MODELS.USER, const_1.PLUGINS.USER_PERMISSIONS).findOne({
                            email: jsonObj.email
                        });
                        order.email = jsonObj.email;
                    }
                    order.eventTime = jsonObj.event_time;
                    order.passthrough = jsonObj.passthrough;
                    order.alertId = jsonObj.alert_id || '-';
                    order.alertName = jsonObj.alert_name || 'fulfillment';
                    order.payload = jsonObj;
                    await strapi.query(const_1.MODELS.PADDLE_ORDER, const_1.PLUGINS.PADDLE_WEBHOOK)
                        .create(order);
                    strapi.log.debug('paddle order created', {
                        data: jsonObj
                    });
                }
                return true;
            }
            else {
                strapi.log.error('invalid paddle order signature', {
                    data: jsonObj
                });
                return false;
            }
        }
        catch (e) {
            strapi.log.error('unexpected error during process paddle order', {
                error: e.message,
                stack: e.stack,
                data: jsonObj
            });
            return false;
        }
    }
}
exports.PaddleService = PaddleService;
const service = new PaddleService();
module.exports = {
    loadPublicKey: service.loadPublicKey,
    addOrder: service.addOrder,
    afterVerified: service.afterVerified
};
