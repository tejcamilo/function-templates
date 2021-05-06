/**

 */

const assets = Runtime.getAssets();
const { detectMissingParams } = require(assets["/missing-params.js"].path);

exports.handler = function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader("Content-Type", "application/json");

  // uncomment to support CORS
  // response.appendHeader('Access-Control-Allow-Origin', '*');
  // response.appendHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  // response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  const missingParams = detectMissingParams(["entity"], event);
  if (missingParams.length > 0) {
    response.setStatusCode(400);
    response.setBody({
      error: {
        message: `Missing parameter; please provide: '${missingParams.join(
          ", "
        )}'.`,
        moreInfo:
          "https://www.twilio.com/docs/verify/api/challenge#create-a-challenge-resource",
      },
    });
    return callback(null, response);
  }

  const client = context.getTwilioClient();
  const serviceSid = context.VERIFY_SERVICE_SID;

  client.verify
    .services(serviceSid)
    .entities(event.entity)
    .factors.list({ limit: 20 })
    .then((factors) => {
      console.log(factors);
      response.setStatusCode(200);
      response.setBody(factors);
      callback(null, response);
    })
    .catch((error) => {
      console.error(error);
      response.setStatusCode(error.status);
      response.setBody({
        error: {
          message: error.message,
          moreInfo: error.moreInfo,
        },
      });
      callback(null, response);
    });
};
