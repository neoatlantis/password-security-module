import _ from "lodash";

var crypto_api = null;


export default function get_or_set(new_crypto_api){
	if(_.isNil(crypto_api)){
		if(!_.isNil(new_crypto_api)){
			crypto_api = new_crypto_api;
		} else {
			throw Error("crypto_api not initialized.");
		}
	}
	return crypto_api;
}