const { json, send } = require('micro')
const shippo = require('shippo')(process.env.SHIPPO_PRIVATE_KEY)
const AWS = require('aws-sdk')
const { createClient } = require('@moltin/request')
const SES = new AWS.SES({
  accessKeyId: process.env.AMAZON_ACCESS_KEY_ID,
  secretAccessKey: process.env.AMAZON_SECRET_ACCESS_KEY,
  region: process.env.AMAZON_REGION
})
const moltin = new createClient({
  client_id: process.env.MOLTIN_CLIENT_ID,
  client_secret: process.env.MOLTIN_CLIENT_SECRET,
  application: 'demo-sync-moltin-to-shippo'
})
const cors = require('micro-cors')({
  allowMethods: ['POST'],
  exposeHeaders: ['x-moltin-secret-key'],
  allowHeaders: [
    'x-moltin-secret-key',
    'x-forwarded-proto',
    'X-Requested-With',
    'Access-Control-Allow-Origin',
    'X-HTTP-Method-Override',
    'Content-Type',
    'Authorization',
    'Accept'
  ]
})

const _toJSON = error => {
  return !error
    ? ''
    : Object.getOwnPropertyNames(error).reduce(
        (jsonError, key) => {
          return { ...jsonError, [key]: error[key] }
        },
        { type: 'error' }
      )
}

const _toCamelcase = string => {
  return !string
    ? ''
    : string.replace(
        /\w\S*/g,
        word => `${word.charAt(0).toUpperCase()}${word.substr(1).toLowerCase()}`
      )
}

const _toLowercase = string => {
  return !string ? '' : string.toLocaleLowerCase()
}

process.on('unhandledRejection', (reason, p) => {
  console.error(
    'Promise unhandledRejection: ',
    p,
    ', reason:',
    JSON.stringify(reason)
  )
})

module.exports = cors(async (req, res) => {
  if (req.method === 'OPTIONS') {
    return send(res, 204)
  }
  if (
    (await req.headers['x-moltin-secret-key']) !=
    process.env.MOLTIN_WEBHOOK_SECRET
  )
    return send(res, 401)

  try {
    /*
{
  id: "95400ff4-d7c4-49bd-b1b9-4c7fd5df6009",
  triggered_by: "order.paid",
  attempt: 1,
  integration: {
    id: "d556dfc0-6eb3-4547-8a2f-5b55d26aee7c",
    integration_type: "webhook",
    name: "DEVELOPMENT: orders to ngrok"
  },
  resources: "{
    "data": {
      "type": "order",
      "id": "26964abb-8572-4473-91bf-683950275cc8",
      "status": "complete",
      "payment": "paid",
      "shipping": "unfulfilled",
      "customer": {
        "name": "Adam Grohs",
        "email": "adam@uniquelyparticular.com"
      },
      "shipping_address": {
        "first_name": "Adam",
        "last_name": "Grohs",
        "phone_number": "",
        "company_name": "",
        "line_1": "19 Riverside Plaza",
        "line_2": "",
        "city": "Chicago",
        "postcode": "60601",
        "county": "Illinois",
        "country": "US",
        "instructions": ""
      },
      "billing_address": {
        "first_name": "Adam",
        "last_name": "Grohs",
        "company_name": "",
        "line_1": "19 Riverside Plaza",
        "line_2": "",
        "city": "Chicago",
        "postcode": "60601",
        "county": "Illinois",
        "country": "US"
      },
      "links": {
        
      },
      "meta": {
        "display_price": {
          "with_tax": {
            "amount": 3782,
            "currency": "USD",
            "formatted": "$37.82"
          },
          "without_tax": {
            "amount": 3782,
            "currency": "USD",
            "formatted": "$37.82"
          },
          "tax": {
            "amount": 0,
            "currency": "USD",
            "formatted": "$0.00"
          }
        },
        "timestamps": {
          "created_at": "2019-04-17T15:10:26Z",
          "updated_at": "2019-04-17T15:10:26Z"
        }
      },
      "relationships": {
        "items": {
          "data": [
            {
              "type": "item",
              "id": "de06df77-48f3-4a0e-b241-104028ceadbd"
            },
            {
              "type": "item",
              "id": "6f8e0286-e3f8-4516-938c-5989af0bc413"
            }
          ]
        },
        "customer": {
          "data": {
            "type": "customer",
            "id": "2fd48b6d-a460-4251-b316-dca6dd0ed115"
          }
        }
      },
      "terminal_id": null
    },
    "included": {
      "items": [
        {
          "type": "order_item",
          "id": "de06df77-48f3-4a0e-b241-104028ceadbd",
          "quantity": 1,
          "product_id": "",
          "name": "Shipping & Handling",
          "sku": "5633d067cd994f8f95eab12b19080ca0",
          "unit_price": {
            "amount": 782,
            "currency": "USD",
            "includes_tax": true
          },
          "value": {
            "amount": 782,
            "currency": "USD",
            "includes_tax": true
          },
          "links": {
            
          },
          "meta": {
            "display_price": {
              "with_tax": {
                "unit": {
                  "amount": 782,
                  "currency": "USD",
                  "formatted": "$7.82"
                },
                "value": {
                  "amount": 782,
                  "currency": "USD",
                  "formatted": "$7.82"
                }
              },
              "without_tax": {
                "unit": {
                  "amount": 782,
                  "currency": "USD",
                  "formatted": "$7.82"
                },
                "value": {
                  "amount": 782,
                  "currency": "USD",
                  "formatted": "$7.82"
                }
              },
              "tax": {
                "unit": {
                  "amount": 0,
                  "currency": "USD",
                  "formatted": "$0.00"
                },
                "value": {
                  "amount": 0,
                  "currency": "USD",
                  "formatted": "$0.00"
                }
              }
            },
            "timestamps": {
              "created_at": "2019-04-17T15:10:26Z",
              "updated_at": "2019-04-17T15:10:26Z"
            }
          },
          "relationships": {
            "cart_item": {
              "data": {
                "type": "cart_item",
                "id": "4fe33442-70ab-42a7-8ef6-c3bdd5c6b7cc"
              }
            }
          }
        },
        {
          "type": "order_item",
          "id": "6f8e0286-e3f8-4516-938c-5989af0bc413",
          "quantity": 1,
          "product_id": "fffd2168-5e80-42ba-8ef9-8f4dc14e87ed",
          "name": "W PRIMER",
          "sku": "190107327756",
          "unit_price": {
            "amount": 3000,
            "currency": "USD",
            "includes_tax": true
          },
          "value": {
            "amount": 3000,
            "currency": "USD",
            "includes_tax": true
          },
          "links": {
            
          },
          "meta": {
            "display_price": {
              "with_tax": {
                "unit": {
                  "amount": 3000,
                  "currency": "USD",
                  "formatted": "$30.00"
                },
                "value": {
                  "amount": 3000,
                  "currency": "USD",
                  "formatted": "$30.00"
                }
              },
              "without_tax": {
                "unit": {
                  "amount": 3000,
                  "currency": "USD",
                  "formatted": "$30.00"
                },
                "value": {
                  "amount": 3000,
                  "currency": "USD",
                  "formatted": "$30.00"
                }
              },
              "tax": {
                "unit": {
                  "amount": 0,
                  "currency": "USD",
                  "formatted": "$0.00"
                },
                "value": {
                  "amount": 0,
                  "currency": "USD",
                  "formatted": "$0.00"
                }
              }
            },
            "timestamps": {
              "created_at": "2019-04-17T15:10:26Z",
              "updated_at": "2019-04-17T15:10:26Z"
            }
          },
          "relationships": {
            "cart_item": {
              "data": {
                "type": "cart_item",
                "id": "53c2c4c9-7b1a-49d5-882d-ab202e7108af"
              }
            }
          }
        }
      ]
    }
  }"
}
*/
    const { triggered_by, resources: body } = await json(req)

    const {
      data: { type: observable, id: observable_id },
      included
    } = JSON.parse(body)

    const [type, trigger] = triggered_by.split('.') //type is 'order', trigger is `created`,`updated`,`fulfilled` or `paid`

    // console.log(`Shipping, type: ${JSON.stringify(type)}`)
    // console.log(`Shipping, observable: ${JSON.stringify(observable)}`)
    // console.log(`Shipping, observable_id: ${JSON.stringify(observable_id)}`)
    // console.log(`Shipping, included.items: ${JSON.stringify(included.items)}`)

    const shipping_item = included.items.find(orderItem =>
      _toLowercase(orderItem.name).startsWith('shipping')
    )

    if (
      type === 'order' &&
      observable === 'order' &&
      observable_id &&
      shipping_item
    ) {
      // just locking down to orders to protect code below
      const observed = await moltin.get(`${observable}s/${observable_id}`)
      // console.log(`Shipping, observed: ${JSON.stringify(observed)}`)
      // console.log(`Shipping, observed.data: ${JSON.stringify(observed.data)}`)
      // console.log(`Shipping, observed.included: ${JSON.stringify(observed.included)}`)

      const {
        data: {
          status: order_status,
          payment: payment_status,
          shipping: shipping_status,
          customer: { name: customer_name, email: billing_email },
          meta: {
            display_price: {
              with_tax: { formatted: total_paid }
            }
          },
          relationships: {
            customer: {
              data: { id: customer_id }
            }
          }
        }
      } = observed

      // console.log(`Shipping, billing_email: ${JSON.stringify(billing_email)}`)
      // console.log(`Shipping, payment_status: ${JSON.stringify(payment_status)}`)
      // console.log(`Shipping, shipping_status: ${JSON.stringify(shipping_status)}`)
      // console.log(`Shipping, shipping_item: ${JSON.stringify(shipping_item)}`)

      if (
        billing_email &&
        payment_status === 'paid' &&
        shipping_status !== 'fulfilled' &&
        shipping_item
      ) {
        console.log(`Shipping, rateId: ${shipping_item.sku}`)

        shippo.transaction
          .create({
            rate: shipping_item.sku,
            label_file_type: 'PDF',
            async: false
          })
          .then(labelResponse => {
            /*
{
  "object_state":"VALID",
  "status":"SUCCESS",
  "object_created":"2013-12-27T19:14:48.273Z",
  "object_updated":"2013-12-27T19:14:48.273Z",
  "object_id":"64bba01845ef40d29374032599f22588",
  "object_owner":"shippotle@goshippo.com",
  "was_test":false,
  "rate":"cf6fea899f1848b494d9568e8266e076",
  "tracking_number":"ZW70QJC",
  "tracking_status":"UNKNOWN",
  "tracking_url_provider":"https://tools.usps.com/go/TrackConfirmAction.action?tLabels=ZW70QJC","eta":"2013-12-30T12:00:00.000Z",
  "label_url":"https://shippo-delivery-east.s3.amazonaws.com/773e695165f74f90b28f07450a7b4161.pdf?Signature=c%2B0eKYDgTOn6chbwpP8Ns9T0DTs%3D&Expires=1536113105&AWSAccessKeyId=AKIAJTHP3LLFMYAWILIA",
  "commercial_invoice_url":"",
  "metadata":"",
  "parcel":"603dbc611dc04170b47c376fae7b68f7"
}
*/
            console.log(
              `Shipping, labelResponse: ${JSON.stringify(labelResponse)}`
            )
            if (
              labelResponse.object_state === 'VALID' &&
              labelResponse.status === 'SUCCESS'
            ) {
              const {
                tracking_number,
                tracking_url_provider: tracking_url,
                label_url
              } = labelResponse

              const params = {
                Destination: {
                  ToAddresses: [billing_email, 'adam@uniquelyparticular.com']
                },
                Message: {
                  Body: {
                    Html: {
                      Charset: 'UTF-8',
                      Data: `<html><body>Order ID: ${observable_id}<br/>${customer_name}: ${billing_email}<br/>Tracking Number: <a href="${tracking_url}" target="_blank">${tracking_number}</a><br/><br/>Shipping Label: <a href="${label_url}" target="_blank">${label_url}</a></body></html>`
                    },
                    Text: {
                      Charset: 'UTF-8',
                      Data: `Order ID: ${observable_id}\n${customer_name}: ${billing_email}\nTracking Number: ${tracking_number}\n\nShipping Label: ${label_url}`
                    }
                  },
                  Subject: {
                    Charset: 'UTF-8',
                    Data: `Order: ${observable_id}`
                  }
                },
                Source: 'receipts@stance.com' /* required */
              }

              SES.sendEmail(params)
                .promise()
                .then(emailResponse => {
                  console.log(
                    `Shipping, emailResponse: ${JSON.stringify(emailResponse)}`
                  )
                  return send(
                    res,
                    200,
                    JSON.stringify({
                      received: true,
                      rateId: shipping_item.sku,
                      trackingNumber: tracking_number
                    })
                  )
                })
                .catch(error => {
                  const jsonError = _toJSON(error)
                  return send(res, 500, jsonError)
                })
            } else {
              const jsonError = _toJSON(labelResponse.messages)
              return send(res, 500, jsonError || 'Error')
            }
          })
          .catch(error => {
            const jsonError = _toJSON(error)
            return send(res, 500, jsonError)
          })
      } else {
        console.error('missing billing_email or rate')
        return send(
          res,
          200,
          JSON.stringify({ received: true, rateId: shipping_item.sku })
        )
      }
    } else {
      console.error('missing order_id')
      return send(res, 200, JSON.stringify({ received: true }))
    }
  } catch (error) {
    const jsonError = _toJSON(error)
    return send(res, 500, jsonError)
  }
})
