export default function (buf){
	let decoder = new TextDecoder();
	return decoder.decode(buf);
}