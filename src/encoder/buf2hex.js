function i2hex(i) {
	return ('0' + i.toString(16)).slice(-2);
}
export default function(uint8){
	return uint8.reduce(function(memo, i) {return memo + i2hex(i)}, '');
}