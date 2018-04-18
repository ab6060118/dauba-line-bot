const express = require('express')
const https = require('https');
const fs = require('fs');
const app = express()

import * as Line from '@line/bot-sdk'
import Config from '../config'

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

app.post('/hook', middleware,(req:any, res:any) => {
	let event = req.body.events[0]
	
	if(event.type === 'message') {
		let message = event.message;
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

		if(message.type === 'text' && message.text === '阿純') {
			client.replyMessage(event.replyToken, {
				type: 'image',
				originalContentUrl: 'https://i.imgur.com/ebLtiKR.jpg',
				previewImageUrl: 'https://i.imgur.com/ebLtiKR.jpg'
			})
		}
	}

	res.json(req.body.events)
/*
	Promise
    	.all(req.body.events.map(handleEvent))
    	.then((result) => res.json(result));
*/
})

server.listen(443, function() {
    console.log('runing Web Server in ' + 443 + ' port...');
});
