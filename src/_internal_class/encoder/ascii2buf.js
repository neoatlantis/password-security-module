export default function encode(ascii){
	if(!/^[\x20-\x7e]*$/.test(ascii)) throw Error("Cannot encode non-ascii");
	let encoder = new TextEncoder();
	return encoder.encode(ascii);
}