const express = require('express')
const https = require('https');
const fs = require('fs');
const app = express()
const fetch = require('node-fetch')

import * as Line from '@line/bot-sdk'
import Config from '../config'

const title:string[] = ['pure', 'myday', 'yh']

const config = {
  channelAccessToken: Config.token,
  channelSecret: Config.secret
}

const client = new Line.Client(config)
const middleware = Line.middleware(config)

const certificate = fs.readFileSync('ssl/fullchain.pem');
const privateKey = fs.readFileSync('ssl/privkey.pem');

const server = https.createServer({
  key: privateKey,
  cert: certificate
}, app);

app.post('/hook', middleware, (req:any, res:any) => {
  let event = req.body.events[0]

  fetch('https://spreadsheets.google.com/feeds/list/1GgJ4i9xSyJZdm1JC_GsUxhh9nf0kTV7iDHFfQvcOl_0/od6/public/values?alt=json')
    .then((s:any) => s.json())
    .then((s:any) => {
      let result:{[key:string]:string[]} = {}
      title.forEach(title => {
        result[title] = []
      })

      s.feed.entry.forEach((e:any) => {
        title.forEach(title => {
          let content = e['gsx$' + title].$t
          if(content) {
            result[title].push(content)
          }
        })
      })
      return result
    })
    .then((result:{[key:string]:string[]}) => {
      if(event.type === 'message') {
        let message = event.message;
        let source = event.source;

        console.log(event);

        if (message.type === 'text' && message.text === '出去!') {
          if (event.source.type === 'group') {
            client.leaveGroup(event.source.groupId);
          }
        }

        if (message.type === 'text' && message.text.includes('嫩')) {
          client.replyMessage(event.replyToken, {
            type: 'text',
            text: '在我眼裡，你們講的話不過就是一堆 JSON String 而已，' + JSON.stringify(event.message)
          })
        }

        if(message.type === 'text' && message.text === '抽買對') {
          let i = Math.floor(Math.random()*(result.myday.length))
          client.replyMessage(event.replyToken, {
            type: 'image',
            originalContentUrl: result.myday[i],
            previewImageUrl: result.myday[i],
          })
        }

        if(message.type === 'text' && message.text === '阿純') {
          let i = Math.floor(Math.random()*(result.pure.length))
          client.replyMessage(event.replyToken, {
            type: 'image',
            originalContentUrl: result.pure[i],
            previewImageUrl: result.pure[i],
          })
        }

        if(message.type === 'text' && message.text === '時代眼淚') {
          client.replyMessage(event.replyToken, {
            type: 'image',
            originalContentUrl: 'https://i.imgur.com/w4MlUNt.jpg',
            previewImageUrl: 'https://i.imgur.com/w4MlUNt.jpg'
          })
        }

        if(message.type === 'text' && message.text.includes('好人卡')) {
          client.replyMessage(event.replyToken, {
            type: 'image',
            originalContentUrl: 'https://i.imgur.com/zHsVX9U.jpg',
            previewImageUrl: 'https://i.imgur.com/zHsVX9U.jpg'
          })
        }

        if(message.type === 'text' && message.text.includes('損友抽') && source.groupId !== 'C89f98d554ab16737a938a336d3034cb6') {
          let i = Math.floor(Math.random()*(result.yh.length))
          client.replyMessage(event.replyToken, {
            type: 'image',
            originalContentUrl: result.yh[i],
            previewImageUrl: result.yh[i],
          })
        }
      }
    })

  res.json(req.body.events)
})

server.listen(443, function() {
  console.log('runing Web Server in ' + 443 + ' port...');
});
