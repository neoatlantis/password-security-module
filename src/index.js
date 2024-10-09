import _ from "lodash";
import set_oracle from "app/primitives/random_oracle";
import set_crypto from "app/primitives/crypto_api";
import PSM from "app/psm";

export function init(asyncRandomOracle, cryptoAPI){

	if(!_.isFunction(asyncRandomOracle)){
		throw Error("Expects a random oracle function.");
	}
	
	set_oracle(asyncRandomOracle);

	if(!_.isNil(cryptoAPI)){
		set_crypto(cryptoAPI);
	} else {
		if(crypto && crypto.subtle){
			set_crypto(crypto);
		} else {
			throw Error("Expects crypto or WebCrypto api.");
		}
	}

	return PSM;
}