import * as Line from '@line/bot-sdk'

const config = {
  channelAccessToken: 'YOUR_CHANNEL_ACCESS_TOKEN',
  channelSecret: 'YOUR_CHANNEL_SECRET'
}

const client = new Line.Client(config)
Line.middleware(config)
