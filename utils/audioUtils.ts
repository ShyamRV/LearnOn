/**
 * Decodes a base64 string into a Uint8Array
 */
const decodeBase64 = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

/**
 * Decodes raw PCM data (Int16) from Gemini into an AudioBuffer.
 * Gemini TTS typically returns 24kHz mono audio.
 */
export const decodeRawPCM = (
  base64Data: string, 
  audioContext: AudioContext, 
  sampleRate: number = 24000
): AudioBuffer => {
  const bytes = decodeBase64(base64Data);
  
  // Create an Int16Array view of the buffer (Little Endian)
  const int16Data = new Int16Array(bytes.buffer);
  
  // Create an AudioBuffer
  const buffer = audioContext.createBuffer(1, int16Data.length, sampleRate);
  const channelData = buffer.getChannelData(0);

  // Convert Int16 to Float32 (-1.0 to 1.0)
  for (let i = 0; i < int16Data.length; i++) {
    // Normalize 16-bit integer to float range [-1, 1]
    // 32768 is the max amplitude for 16-bit signed integer
    channelData[i] = int16Data[i] / 32768.0;
  }

  return buffer;
};

/**
 * Writes a string to a DataView
 */
const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

/**
 * Converts an AudioBuffer to a WAV Blob for downloading
 */
export const bufferToWave = (abuffer: AudioBuffer, len: number): Blob => {
  const numOfChan = abuffer.numberOfChannels;
  const length = len * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const channels = [];
  let i;
  let sample;
  let offset = 0;
  let pos = 0;

  // write WAVE header
  writeString(view, offset, 'RIFF'); offset += 4;
  view.setUint32(offset, length - 8, true); offset += 4;
  writeString(view, offset, 'WAVE'); offset += 4;
  writeString(view, offset, 'fmt '); offset += 4;

  view.setUint32(offset, 16, true); offset += 4; // Subchunk1Size
  view.setUint16(offset, 1, true); offset += 2; // AudioFormat (PCM)
  view.setUint16(offset, numOfChan, true); offset += 2;
  view.setUint32(offset, abuffer.sampleRate, true); offset += 4;
  view.setUint32(offset, abuffer.sampleRate * 2 * numOfChan, true); offset += 4; // ByteRate
  view.setUint16(offset, numOfChan * 2, true); offset += 2; // BlockAlign
  view.setUint16(offset, 16, true); offset += 2; // BitsPerSample

  writeString(view, offset, 'data'); offset += 4;
  view.setUint32(offset, length - pos - 44, true); offset += 4;

  // interleave channels
  for (i = 0; i < abuffer.numberOfChannels; i++) {
    channels.push(abuffer.getChannelData(i));
  }

  while (pos < len) {
    for (i = 0; i < numOfChan; i++) {
      // clamp
      sample = Math.max(-1, Math.min(1, channels[i][pos])); 
      // scale to 16-bit signed int
      sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF) | 0; 
      view.setInt16(offset, sample, true); 
      offset += 2;
    }
    pos++;
  }

  return new Blob([buffer], { type: 'audio/wav' });
};