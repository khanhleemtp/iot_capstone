const fs = require('fs')

const BROKER_HOST = 'localhost'
const BROKER_USERNAME = 'guest'
const BROKER_PASSWORD = 'guest'
const BROKER_PORT = '5672' 
const BROKER_QUEUE = 'parking'

let mode = 'auto'
let image = ''
let sessionType = ''

if (process.argv.length >= 4) {
  mode = 'manual'
  image = process.argv[2]
  sessionType = process.argv[3]
}

// AMQP connection
const conn = require('amqplib').connect(`amqp://${BROKER_USERNAME}:${BROKER_PASSWORD}@${BROKER_HOST}:${BROKER_PORT}`)
.then(function(conn) {
  return conn.createChannel()
}).then(async (channel) => {
  switch (mode) {
    case 'auto':

      let inCars = []
      let outCars = fs.readdirSync('images')

      let ratio

      while (true) {
        if (inCars.length == 0) {
          ratio = 1
        } else if (outCars.length == 0) {
          ratio = 0
        } else {
          ratio = outCars.length / (inCars.length + outCars.length)
        }

        if (ratio < 0.5) {
          let sendingIndex = Math.floor(Math.random() * inCars.length)
          image = inCars.splice(sendingIndex, 1)
          outCars.push(image)
          sessionType = 'out'
        } else {
          let sendingIndex = Math.floor(Math.random() * outCars.length)
          image = outCars.splice(sendingIndex, 1)
          inCars.push(image)
          sessionType = 'in'
        }

        publish(channel, image, sessionType)

        await sleep(5000)
      }
      break
    case 'manual':
      publish(channel, image, sessionType)
      break
  }
})
.catch(console.warn);

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
} 

function imageBuffer(image) {
  let data =fs.readFileSync(image)
  return data.toString('base64')
}

function publish(channel, image, sessionType) {
  image = 'images/' + image
  return channel.assertQueue(BROKER_QUEUE, {durable: true, autoDelete:false}).then(function(ok) {
    console.log('Image sent: ' + image)
    return channel.sendToQueue(BROKER_QUEUE, Buffer.from(JSON.stringify({
      type: sessionType,
      time: '' + Date.now(),
      image: imageBuffer(image)
    })))
  })
}