const WebSocket = require('ws');
const qr = require('qrcode-terminal');
const HttpsProxyAgent = require('https-proxy-agent');
var url = require('url');

var proxy = 'http://127.0.0.1:8888';
var endpoint = 'wss://w5.web.whatsapp.com/ws';

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

var options = url.parse(endpoint);
var agent = HttpsProxyAgent(proxy);
options.agent = agent;

const wss = new WebSocket(endpoint, {
    agent: agent,
    headers: {
        Origin: 'https://web.whatsapp.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
        'Cookie': 'wa_lang_pref=en'
    }
});

wss.on('open', function () {
    wss.send(parseInt((new Date()).getTime()/1000) + '.--0,["admin","init",[0,3,1649],["Windows 10","Chrome"],"4lmBg6Os19JXpeXVugOtBQ==",true]');
});

let no = 1;
let payload = '62812';

wss.on('message', function (data) {
    if (typeof data == 'string') {
        let code = data.match(/--(\d+)/);

        let start = data.indexOf(',') + 1;
        let json = "";

        try {
            json = JSON.parse(data.substr(start, data.length))
        } catch (e) {
            //ignore
        }

        if (data.startsWith("s1")) {
            wss.send('309.--0,,["query","ProfilePicThumb","089898989898@c.us"]');
        } else if (data.startsWith("309")) {
            if (json.hasOwnProperty('eurl')) {
                console.log(payload.toString() + no);
                console.log(json.eurl);
            } else {
                if (typeof json == 'string') {
                    --no;
                }
            }

            if ((payload.toString() + no.toString()).toString().length > 13) {
                process.exit();
            }

            wss.send('309.--' + no.toString() + ',,["query","ProfilePicThumb","' + payload.toString() + no.toString() + '@c.us"]');
            ++no;
        } else if (code != null && code.length > 1) {
            switch(parseInt(code[1])) {
                case 0:
                    qr.generate(json.ref + ',tJH2YV7MGvb4jDiw7RGUgnXH2ML5rFAHFvH8YIC5YlE=,oMa6o9E3lV8R1raGLQoVrg==');
                    wss.send(parseInt((new Date()).getTime() / 1000) + '.--1,["admin","Conn","reref"]')
                break;
                default:
                    console.log(json);
                break;
            }
        } else {
            console.log(json);
        }
    } else {
        console.log(data);
    }
});