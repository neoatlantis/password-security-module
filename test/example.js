const psm = require("../dist/psm.js").psm;
const oracle = (data)=>{
	// In actual use case, you should use a HMAC function here.
  	return crypto.subtle.digest("SHA-512", data);
}

const PSM = psm.init(oracle);

const default_psm = new PSM("default");

console.log(default_psm);
