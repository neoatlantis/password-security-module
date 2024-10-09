import is_uint8array from "@stdlib/assert-is-uint8array";

import { digestAttributesDict } from "app/AttributesDict";
import { buf2ascii, buf2hex, buf2password } from "app/_internal_class/encoder";
import SignedNonce from "app/_internal_class/SignedNonce";

const subtle = crypto.subtle;


const DATA_SIZE_LIMIT = 102400; // 100kB

class DataVault {

	#signed_nonce;

	constructor(basic_dict){
		this.#signed_nonce = new SignedNonce(
			basic_dict,
			"data-vault-nonce"
		);
	}

	async encrypt(data){
		if(!is_uint8array(data)){
			throw Error("data must be Uint8Array");
		}
		if(data.length > DATA_SIZE_LIMIT) throw Error("data too large");

		let signed_nonce_hex = 
			await this.#signed_nonce.create_nonce_for_buffer(data);


	}

}