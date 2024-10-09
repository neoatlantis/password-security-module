/*

pwdgen://<domain-name>/<nonce>?length=10&lower&upper&numeric&special

*/
//import crypto from "crypto";
import { digestAttributesDict } from "app/AttributesDict";
import hdkf_derive_bytes from "app/subtlecrypto_call/hkdf_derive_bytes.js";
import { buf2ascii, buf2hex, buf2password } from "app/encoder";
import url_parse from "url-parse";
import SignedNonce from "app/_internal_class/SignedNonce";

const PROTOCOL = "psm-pwdgen";

const ALPHABET_SPECIAL = "_!@#$%^&";



class PasswordDeriveByRule {

	#length;
	#upper;
	#lower;
	#number;
	#special;

	constructor({ length, upper, lower, number, special }){
		this.#length = _.isInteger(length) && length > 0 ? length : 20;
		this.#upper = _.isBoolean(upper) ? upper : false;
		this.#lower = _.isBoolean(lower) ? lower : false;
		this.#number = _.isBoolean(number) ? number : false;
		this.#special = _.isBoolean(special) ? special : false;
	}

	static from_querystring(querystring){
		let qp = new URLSearchParams(querystring);
		return new PasswordDeriveByRule({
			length: _.parseInt(qp.get('length')),
			upper: null !== qp.get('upper'),
			lower: null !== qp.get('lower'),
			number: null !== qp.get('number'),
			special: null !== qp.get('special'),
		});
	}

	toString(){
		return _.compact([
			"length=" + this.#length,
			this.#upper ? 'upper' : null,
			this.#lower ? 'lower' : null,
			this.#number ? 'number': null,
			this.#special ? 'special' : null,
		]).join("&");
	}

	async derive(seed){
		let alphabet = "";
		if(this.#upper) alphabet += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		if(this.#lower) alphabet += "abcdefghijklmnopqrstuvwxyz";
		if(this.#number) alphabet += "0123456789";
		if(this.#special) alphabet += ALPHABET_SPECIAL;

		if(alphabet.length <= 1){
			throw Error("Cannot derive password based on this rule.");
		}

		function filter(s){
			return s.split("").filter(e=>alphabet.indexOf(e)>=0).join("");
		}

		let ret = "";

		let counter = new Uint8Array(1);
		for(let i=0; i<=0xff; i++){
			counter[0] = i;

			let material = new Uint8Array(await hdkf_derive_bytes({
				key: new Uint8Array(seed),
				algorithm: 'SHA-512',
				salt: counter,
				info: new Uint8Array([]),
				bytes_length: 128
			}));

			let string = filter(
				buf2password(material).slice(0, -5)
			);
			ret += string;

			if(ret.length >= this.#length) break;			
		}

		if(ret.length < this.#length){
			throw Error("Unable to satisfy password requirements.");
		}
		return ret.slice(0, this.#length);
	}

}






class PasswordGenerator {

	#dict;
	#signed_nonce;

	constructor(basic_dict){
		this.#dict = basic_dict.clone();
		this.#dict.set("object.type", "password-generator");
		this.#dict.lock();

		this.#signed_nonce = new SignedNonce(
			basic_dict,
			"password-generator-nonce"
		);
	}

	async create_url(domain_name){
		let nonce = 
			await this.#signed_nonce.create_nonce_for_domain(domain_name);
		let url = new URL(nonce, PROTOCOL+"://" + domain_name);
		let default_rule = new PasswordDeriveByRule({});
		return url.toString() + "?" + default_rule.toString();
	}

	async get_password(psm_pwdgen_url){
		//let url = new URL(psm_pwdgen_url);
		let url = url_parse(psm_pwdgen_url);
		if(url.protocol != PROTOCOL + ":"){
			throw Error("Not a password generator URL.");
		}

		let tempdict = this.#dict.clone();
		tempdict.set("object.domain", url.hostname);

		let nonce = url.pathname.split("/")[1];
		if(!(await this.#signed_nonce.verify_nonce_of_domain(
			url.hostname, nonce))
		){
			throw Error("Invalid password generator URL.");
		}
		tempdict.set("object.nonce", nonce);

		let serialized = tempdict.serialize();
		let seed = await digestAttributesDict.call(tempdict);
		
		let derive_by_rule = PasswordDeriveByRule.from_querystring(url.query);
		return await derive_by_rule.derive(seed);
	}



}

export default PasswordGenerator;