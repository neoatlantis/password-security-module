const crypto = require("crypto");
const psm = require("../dist/psm.dev.js");
const buffer = require("buffer");


const oracle = async (data)=>{
	// In actual use case, you should use a HMAC function here.
  	// return crypto.subtle.digest("SHA-512", data);

  	// Test with a HMAC function
  	console.log("Signing: ", buffer.Buffer.from(data).toString("utf-8"));
  	let key = await crypto.subtle.digest("SHA-512", new Uint8Array([1,2,3,4]));
    return crypto.createHmac('sha512', key).update(data).digest();
}

const PSM = psm.init(oracle);

const default_psm = new PSM("default");

(async ()=>{

	let pwdgen = default_psm.get_password_generator();

	let url = await pwdgen.create_url("google.com");
	//url = "psm-pwdgen://google.com/10600d367b850d0af211807298a08da0eabe227c141632c517fd?length=20"; // with SHA-512 as oracle
	url = "psm-pwdgen://google.com/6792ea41f275ca36670efdc878d3cbae14fdbf8518d3c83e554f?length=40";	// with HMAC-SHA-512 as oracle
	console.log(await pwdgen.get_password(url + '&upper'));
	console.log(await pwdgen.get_password(url + '&upper&lower'));
	console.log(await pwdgen.get_password(url + '&upper&lower&number'));

})();


