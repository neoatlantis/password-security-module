const fromHexString = (hexString) => {
  if(hexString.length % 2) throw Error("not a hex string");
  return Uint8Array.from(
    hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  );
}

export default fromHexString;