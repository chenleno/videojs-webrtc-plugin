export class WebRTCAdaptor {
  constructor(initialValues) {
    this.pc = null // webrtc peerconnection
    this.player = null; // videojs player
    this.webrtcUrl = '' // webrtc stream url
    this.onEvent = null // event trigger

    for (const key in initialValues) {
      if (initialValues.hasOwnProperty(key)) {
        this[key] = initialValues[key];
      }
    }
  }

  _trigger(evt, msg) {
    if (this.onEvent && typeof this.onEvent === 'function') {
      this.onEvent({ event: evt, message: msg })
    }
  }

  play() {
    if(!this.getPeerConnection()) {
      const pc = this.createPeerConnection()
      this.setPeerConnection(pc)
      this.createOffer()
    }
  }

  async stop() {
    if (this.getPeerConnection()) {
      this.close()
    }
  }

  muteVideo(mute) {
    const videoTrack = this.getVideoTrack()
    if (videoTrack) {
      if (videoTrack.enabled !== !mute) {
        videoTrack.enabled = !mute
      }
    }
  }

  muteAudio(mute) {
    const audioTrack = this.getAudioTrack()
    if (audioTrack) {
      if (audioTrack.enabled !== !mute) {
        audioTrack.enabled = !mute
      }
    }
  }

  getStats() {
    if (!this.getPeerConnection()) {
      return Promise.reject(0)
    }
    return this.getPeerConnection().getStats()
  }


  getMediaStream() {
    if(!this.pc) return;
    return this.pc.getRemoteStreams()[0]
  }

  removeMediaStream(mediaStream) {
    if(!this.pc) return;
    if (!mediaStream) return;
    return this.pc.removeStream(mediaStream)
  }

  getVideoTrack() {
    if (!this.getMediaStream()) return;
    return this.getMediaStream().getVideoTracks()[0]
  }

  getAudioTrack() {
    if (!this.getMediaStream()) return;
    return this.getMediaStream().getAudioTracks()[0]
  }

  createPeerConnection() {
    const pc = new RTCPeerConnection();
    return pc
  }

  setPeerConnection(pc) {
    if(!this.pc) {
      this.pc = pc
      this.pc.onaddstream = this.onaddstream.bind(this)
      this.pc.onremovestream = this.onremovestream.bind(this)
      this.pc.onicecandidate = this.onicecandidate.bind(this)
      this.pc.oniceconnectionstatechange = this.oniceconnectionstatechange.bind(this)
      this.pc.onconnectionstatechange = this.onconnectionstatechange.bind(this)
    }
  }

  getPeerConnection() {
    return this.pc
  }

  createOffer() {
    if (!this.pc) return Promise.reject(0);
    return new Promise(async (resolve, reject) => {
      try {
        const offerSdp = await this.pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        })
        await this.setLocalDescription(offerSdp)
        resolve()
      }catch(err) {
        reject(err)
      }
    })
  }

  setLocalDescription(sdpInfo) {
    if (!this.pc) return Promise.reject(0)
    return new Promise(async (resolve, reject) => {
      try {
        await this.pc.setLocalDescription(sdpInfo)
        await this.onOfferGenerated(sdpInfo)
        resolve()
      }catch(err) {
        reject(err)
      }
    })
  }

  setRemoteDescription(remoteSdp) {
    if (!this.pc) return Promise.reject(0)
    return new Promise(async (resolve, reject) => {
      try {
        await this.pc.setRemoteDescription(new RTCSessionDescription(remoteSdp))
        resolve()
      }catch(err) {
        reject(err)
      }
    })
  }

  close() {
    if (this.getPeerConnection()) {
      this.getPeerConnection().close()
      this.pc = null
    }
  }

  onaddstream(mediaStreamEvent) {
    if (this.player) {
      const videoEle_ = this.player.tech_.el();
      videoEle_.srcObject = mediaStreamEvent.stream;
    }
  }

  onremovestream() {
  }

  onicecandidate(iceEvent) {
  }

  oniceconnectionstatechange(event) {
    const iceConnectionState = this.pc.iceConnectionState
    switch(iceConnectionState) {
      case 'failed':
        break
      case 'connected':
        break
      case 'completed':
        break
    }
  }

  onconnectionstatechange(event) {
    const connectionState = this.pc.connectionState
    
    if(connectionState === 'failed'){
      this._trigger('connectionError', 'connection state change to failed')
    }
  }

  sdpExchanger() {
    // TODO: get your sdp answer in your way (ajax, websocket, etc...)
    const sdpInfo = {}
    return Promise.resolve(sdpInfo)
  }

  onOfferGenerated(sdpInfo) {
    if (!sdpInfo) return Promise.reject(0)
    return new Promise(async (resolve, reject) => {
      try {
        const remotesdp = await sdpExchanger()
        await this.setRemoteDescription(remotesdp)
        resolve()
      }catch(err) {
        this._trigger('pullStreamError', err)
        reject(err)
      }
    })
  }
}
