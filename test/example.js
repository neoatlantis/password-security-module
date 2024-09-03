const psm = require("../dist/psm.dev.js");
const oracle = (data)=>{
	// In actual use case, you should use a HMAC function here.
  	return crypto.subtle.digest("SHA-512", data);
}

const PSM = psm.init(oracle);

const default_psm = new PSM("default");

(async ()=>{

	let pwdgen = default_psm.get_password_generator();

	let url = await pwdgen.create_url("google.com");
	url = "psm-pwdgen://google.com/10600d367b850d0af211807298a08da0eabe227c141632c517fd?length=20&upper";
	url += '&upper';
	console.log(url);
	console.log(await pwdgen.get_password(url));

})();


