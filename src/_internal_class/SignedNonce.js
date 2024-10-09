import { digestAttributesDict } from "app/AttributesDict";
import { buf2ascii, buf2hex, buf2password } from "app/_internal_class/encoder";

const NONCE_LENGTH_BYTES = 16;
const NONCE_SIGN_LENGTH_BYTES = 10;

class SignedNonce {

	#nonce_dict;

	constructor(basic_dict, nonce_type){
		this.#nonce_dict = basic_dict.clone();
		this.#nonce_dict.set("object.type", nonce_type);
		this.#nonce_dict.lock();
	}

	async #create_nonce(modifier_func){
		let raw_nonce_hex = buf2hex(
			crypto.getRandomValues(new Uint8Array(NONCE_LENGTH_BYTES))
		);
		let tempdict = this.#nonce_dict.clone();
		tempdict.set("object.nonce", raw_nonce_hex);
		modifier_func(tempdict);

		let signed_nonce = await digestAttributesDict.call(tempdict);
		return (
			raw_nonce_hex +
			buf2hex(signed_nonce).slice(0,2*NONCE_SIGN_LENGTH_BYTES)
		);
	}

	async #verify_nonce(modifier_func, nonce_hex){
		if(nonce_hex.length < 2*(NONCE_LENGTH_BYTES+NONCE_SIGN_LENGTH_BYTES)){
			return false;
		}

		let tempdict = this.#nonce_dict.clone();
		let raw_nonce_hex = nonce_hex.slice(0, 2*NONCE_LENGTH_BYTES);
		tempdict.set("object.nonce", raw_nonce_hex);
		modifier_func(tempdict);

		let signed_nonce = await digestAttributesDict.call(tempdict);
		let signed_nonce_hex = buf2hex(signed_nonce)
			.slice(0,2*NONCE_SIGN_LENGTH_BYTES);

		return nonce_hex == raw_nonce_hex + signed_nonce_hex;
	}



	async create_nonce_for_domain(domain_name){
		return await this.#create_nonce((tempdict)=>{
			tempdict.set("object.domain", domain_name);
		});
	}

	async verify_nonce_of_domain(domain_name, nonce_hex){
		return await this.#verify_nonce((tempdict)=>{
			tempdict.set("object.domain", domain_name);
		}, nonce_hex);
	}

	async create_nonce_for_buffer(data){
		return await this.#create_nonce((tempdict)=>{
			tempdict.set("object.data", buf2hex(data));
		});
	}

	async verify_nonce_of_buffer(data, nonce_hex){
		return await this.#verify_nonce((tempdict)=>{
			tempdict.set("object.data", buf2hex(data));
		}, nonce_hex);
	}
}

export default SignedNonce;