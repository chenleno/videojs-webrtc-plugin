# videojs-webrtc-plugin

a common videojs plugin for webrtc

>note: 
you must rewrite the `sdpExchanger` part for your own feature

## usage

```js
import webRTCSourceHandler from 'videojs-webrtc-plugin.es.js'
import videojs from 'videojs'

const h5Video = videojs.getTech('Html5')!
h5Video.registerSourceHandler(webRTCSourceHandler);

const webrtcUrl = 'xxxx'
const player = videojs()

player.src({ src: webrtcUrl, webrtc: true })
player.play()

```

