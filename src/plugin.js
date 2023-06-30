import videojs from 'video.js';
import 'adapter'
import {WebRTCAdaptor} from './webrtc_adaptor';

// Default options for the plugin.
const defaults = {
  sdpConstraints: { OfferToReceiveAudio: true, OfferToReceiveVideo: true },
  mediaConstraints: { video: false, audio: false }
};

/**
 * An advanced Video.js plugin for playing WebRTC stream from Ant-mediaserver
 */
class WebRTCHandler {
  /**
   * Create a WebRTC source handler instance.
   *
   * @param  {Object} source
   *         Source object that is given in the DOM, includes the stream URL
   *          src   webrtc stream url
   *          webrtc    a boolean whether use webrtc
   * @param  {Object} [options]
   *         Options include:
   *          playerId    videoPlayer id
   */
  constructor(source, tech, options) {
    this.player = videojs(options.playerId);
    this.initiateWebRTCAdaptor(source, options);
  }
  /**
   * Initiate WebRTCAdaptor.
   *
   * @param  {Object} [options]
   * An optional options object.
   *
   */
  initiateWebRTCAdaptor(source, options) {
    this.options = videojs.mergeOptions(defaults, options);
    this.source = source;
    const webrtcUrl = this.source.src
    this.webRTCAdaptor = new WebRTCAdaptor({
      webrtcUrl: webrtcUrl,
      player: this.player,
      onEvent: this.onEvent.bind(this)
    });
    this.webRTCAdaptor.play()
  }

  /**
   * evtInfo: { event: evt, message: msg }
   */
  onEvent(evtInfo) {
    const { event, message } = evtInfo
    this.player.trigger(event, message)
  }

  /**
   * @description dispose peerconnection and release stream
   * @return {void}
   */
  dispose() {
    if (this.webRTCAdaptor) {
      this.webRTCAdaptor.stop();
      this.webRTCAdaptor = null;
    }
  }

  /**
   * @description receive or stop receive videoTrack data
   * @param {Boolean} mute 
   * @returns {void}
   */
  muteVideo(mute) {
    if (!this.webRTCAdaptor) return;
    this.webRTCAdaptor.muteVideo(mute)
  }

  /**
   * @description receive or stop receive audioTrack data
   * @param {Boolean} mute 
   * @returns {void}
   */
  muteAudio(mute) {
    if (!this.webRTCAdaptor) return;
    this.webRTCAdaptor.muteAudio(mute)
  }

  /**
   * @description get webrtc statistic data
   * @returns {Promise}
   */
  getStats() {
    if (!this.webRTCAdaptor) return Promise.reject(0);
    return this.webRTCAdaptor.getStats()
  }
}

const webRTCSourceHandler = {
  name: 'videojs-webrtc-plugin',
  VERSION: '1.0',
  canHandleSource(srcObj, options = {}) {
    const localOptions = videojs.mergeOptions(videojs.options, options);
    localOptions.source = srcObj.src;
    const canhandle = webRTCSourceHandler.canPlayType(srcObj.type, localOptions);
    return canhandle
  },
  handleSource(source, tech, options = {}) {
    const localOptions = videojs.mergeOptions(videojs.options, options);
    if (tech.webrtc) {
      tech.webrtc.dispose();
      tech.webrtc = null;
    }
    // Register the plugin to source handler tech
    tech.webrtc = new WebRTCHandler(source, tech, localOptions);
    return tech.webrtc;
  },
  canPlayType(type, options = {}) {
    const useWebrtc = options.webrtc
    if (useWebrtc) {
      return 'maybe';
    }
    return '';
  }
};

export default webRTCSourceHandler
