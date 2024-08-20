const psm = require("../dist/psm.dev.js");
const oracle = (data)=>{
	// In actual use case, you should use a HMAC function here.
  	return crypto.subtle.digest("SHA-512", data);
}

const PSM = psm.init(oracle);

const default_psm = new PSM("default");

default_psm.export().then(console.log);
