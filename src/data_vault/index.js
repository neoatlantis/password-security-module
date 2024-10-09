import _ from "lodash";
import is_uint8array from "@stdlib/assert-is-uint8array";

import { digestAttributesDict } from "app/AttributesDict";
import { buf2ascii, buf2hex, hex2buf, buf2password } from "app/_internal_class/encoder";
import { encode, decode } from "@msgpack/msgpack";

import SignedNonce from "app/_internal_class/SignedNonce";
import get_crypto from "app/primitives/crypto_api";
import get_oracle from "app/primitives/random_oracle";



const get_subtle = ()=>get_crypto().subtle;


const DATA_SIZE_LIMIT = 102400; // 100kB
const PROTOCOL = "psm-vault";


class DataVault {

	#signed_nonce;
	#dict;

	constructor(basic_dict){
		this.#dict = basic_dict.clone();
		this.#dict.set("object.type", "data-vault");
		this.#dict.lock();

		this.#signed_nonce = new SignedNonce(
			basic_dict,
			"data-vault-nonce"
		);
	}

	async #get_key(signed_nonce_hex, randomness_hex){
		let dict = this.#dict.clone();
		dict.set("object.nonce", signed_nonce_hex);
		dict.set("object.data", randomness_hex);

		let secret_bytes = await digestAttributesDict.call(dict);

		let secret_key = await get_subtle().importKey(
			'raw',
			secret_bytes.slice(0, 32),
			{ name: "AES-CBC" },
			false,
			["encrypt", "decrypt"]
		);

		get_crypto().getRandomValues(secret_bytes); // clear the key
		return secret_key;
	}

	async encrypt(data){
		if(!is_uint8array(data)){
			throw Error("data must be Uint8Array");
		}
		if(data.length > DATA_SIZE_LIMIT) throw Error("data too large");

		let signed_nonce_hex = 
			await this.#signed_nonce.create_nonce_for_buffer(data);

		let iv = get_crypto().getRandomValues(new Uint8Array(16));
		let iv_hex = buf2hex(iv);

		// get key
		let key = await this.#get_key(signed_nonce_hex, iv_hex);

		const params = { name: 'AES-CBC', iv };
		let encrypted = new Uint8Array(
			await get_subtle().encrypt(params, key, data)
		);

		return (
			PROTOCOL + ":/" + 
			"/i/" + iv_hex +
			"/n/" + signed_nonce_hex +
			"/data/" + buf2hex(encrypted)
		);
	}

	async decrypt(url){
		if(!_.startsWith(url, PROTOCOL + "://")){
			throw Error("Not a vault url.");
		}
		let url_parts = url.split("/");

		let iv_hex = _.get(url_parts, 3),
			signed_nonce_hex = _.get(url_parts, 5),
			encrypted = hex2buf(_.get(url_parts, 7));

		let iv = hex2buf(iv_hex);
		let key = await this.#get_key(signed_nonce_hex, iv_hex);

		const params = { name: 'AES-CBC', iv };
		let plaintext = new Uint8Array(
			await get_subtle().decrypt(params, key, encrypted)
		);

		let ok = await this.#signed_nonce.verify_nonce_of_buffer(
			plaintext, signed_nonce_hex);

		if(!ok)	throw Error("Plaintext corrupted.");
		return plaintext;
	}

}

export default DataVault;