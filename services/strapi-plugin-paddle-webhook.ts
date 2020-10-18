// @ts-ignore
import fs from 'fs';
// @ts-ignore
import crypto from 'crypto';
import {MODELS, PLUGINS} from "../const";

/**
 * `Paddle` service.
 */

const Serialize = require('php-serialize');

const ksort = (obj) => {
  const keys = Object.keys(obj).sort();
  let sortedObj = {};

  for (let i in keys) {
    sortedObj[keys[i]] = obj[keys[i]];
  }

  return sortedObj;
};

export class PaddleService {
  publicKey: string | null = null;

  loadPublicKey() {
    try {
      service.publicKey = fs.readFileSync(strapi.config.plugins[`strapi-plugin-${PLUGINS.PADDLE_WEBHOOK}`].publicKeyPath).toString('utf8');
      strapi.log.debug('paddle public key loaded', {
        path: strapi.config.plugins[`strapi-plugin-${PLUGINS.PADDLE_WEBHOOK}`].publicKeyPath
      });
    } catch (e) {
      strapi.log.error('paddle public key load filed', {
        path: strapi.config.plugins[`strapi-plugin-${PLUGINS.PADDLE_WEBHOOK}`].publicKeyPath,
        e: e
      });
      throw new Error(e);
    }
  }

  /**
   * Called after successful verification.
   *
   * @return whether a PaddleOrder item should be created
   */
  async afterVerified(_payload: any): Promise<boolean> {
    // do something with the data
    return true;
  }

  async addOrder(jsonObj): Promise<boolean> {
    try {
      const mySig = Buffer.from(jsonObj.p_signature, 'base64');
      delete jsonObj.p_signature;
// Need to serialize array and assign to data object
      jsonObj = ksort(jsonObj);
      for (let property in jsonObj) {
        if (jsonObj.hasOwnProperty(property) && (typeof jsonObj[property]) !== 'string') { // eslint-disable-line
          if (Array.isArray(jsonObj[property])) { // is it an array
            jsonObj[property] = jsonObj[property].toString();
          } else { //if its not an array and not a string, then it is a JSON obj
            jsonObj[property] = JSON.stringify(jsonObj[property]);
          }
        }
      }
      const serialized = Serialize.serialize(jsonObj);
      // End serialize data object
      const verifier = crypto.createVerify('sha1');
      verifier.update(serialized);
      verifier.end();

      // @ts-ignore
      const verification = verifier.verify(service.publicKey, mySig);

      if (verification) {
        strapi.log.debug('paddle order signature verified', {});

        const saveOrder = await service.afterVerified(jsonObj);
        if (saveOrder) {
          const order = {} as PaddleOrder;

          if (jsonObj.email) {
            order.user = await strapi.query(MODELS.USER, PLUGINS.USER_PERMISSIONS).findOne({
              email: jsonObj.email
            });
            order.email = jsonObj.email;
          }

          order.eventTime = jsonObj.event_time;
          order.passthrough = jsonObj.passthrough;
          order.alertId = jsonObj.alert_id || '-';
          order.alertName = jsonObj.alert_name || 'fulfillment';
          order.payload = jsonObj;

          await strapi.query(MODELS.PADDLE_ORDER, PLUGINS.PADDLE_WEBHOOK)
            .create(order);

          strapi.log.debug('paddle order created', {
            data: jsonObj
          });
        }
        return true;
      } else {
        strapi.log.error('invalid paddle order signature', {
          data: jsonObj
        });
        return false;
      }
    } catch (e) {
      strapi.log.error('unexpected error during process paddle order', {
        error: e.message,
        stack: e.stack,
        data: jsonObj
      });
      return false;
    }
  }
}

const service = new PaddleService();
module.exports = {
  loadPublicKey: service.loadPublicKey,
  addOrder: service.addOrder,
  afterVerified: service.afterVerified
};
