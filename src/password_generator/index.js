/*

pwdgen://<domain-name>/<nonce>?length=10&lower&upper&numeric&special

*/
import crypto from "crypto";
import buffer from "buffer";
import { digestAttributesDict } from "app/AttributesDict";
import ascii85 from "ascii85";

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
			let material = await new Promise((resolve, reject)=>{
				crypto.hkdf('sha512', seed, counter, "", 128, (err, key)=>{
					if(err) return reject(err);
					resolve(key);
				});
			});

			let string = filter(
				ascii85.encode(material).toString().slice(0, -5)
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



const NONCE_LENGTH_BYTES = 16;
const NONCE_SIGN_LENGTH_BYTES = 10;


class PasswordGenerator {

	#dict;
	#nonce_dict;

	constructor(basic_dict){
		this.#dict = basic_dict.clone();
		this.#dict.set("object.type", "password-generator");
		this.#dict.lock();

		this.#nonce_dict = basic_dict.clone();
		this.#nonce_dict.set("object.type", "password-generator-nonce");
		this.#nonce_dict.lock();
	}

	async #create_nonce(domain_name){
		let raw_nonce_hex = buffer.Buffer.from(
			crypto.getRandomValues(new Uint8Array(NONCE_LENGTH_BYTES))
		).toString('hex');
		let tempdict = this.#nonce_dict.clone();
		tempdict.set("object.domain", domain_name);
		tempdict.set("object.nonce", raw_nonce_hex);

		console.log(tempdict.serialize());
		let signed_nonce = await digestAttributesDict.call(tempdict);
		return (
			raw_nonce_hex +
			buffer.Buffer.from(signed_nonce).toString('hex')
				.slice(0,2*NONCE_SIGN_LENGTH_BYTES)
		);
	}

	async #verify_nonce(domain_name, nonce_hex){
		if(nonce_hex.length < 2*(NONCE_LENGTH_BYTES+NONCE_SIGN_LENGTH_BYTES)){
			return false;
		}
		let tempdict = this.#nonce_dict.clone();
		let raw_nonce_hex = nonce_hex.slice(0, 2*NONCE_LENGTH_BYTES);
		tempdict.set("object.domain", domain_name);
		tempdict.set("object.nonce", raw_nonce_hex);

		let signed_nonce = await digestAttributesDict.call(tempdict);
		let signed_nonce_hex = buffer.Buffer.from(signed_nonce).toString('hex')
			.slice(0,2*NONCE_SIGN_LENGTH_BYTES);

		return nonce_hex == raw_nonce_hex + signed_nonce_hex;
	}

	async create_url(domain_name){
		let nonce = await this.#create_nonce(domain_name);
		let url = new URL(nonce, PROTOCOL+"://" + domain_name);
		let default_rule = new PasswordDeriveByRule({});
		return url.toString() + "?" + default_rule.toString();
	}

	async get_password(psm_pwdgen_url){
		let url = new URL(psm_pwdgen_url);
		if(url.protocol != PROTOCOL + ":"){
			throw Error("Not a password generator URL.");
		}

		let tempdict = this.#dict.clone();
		tempdict.set("object.domain", url.hostname);

		let nonce = url.pathname.split("/")[1];
		if(!(await this.#verify_nonce(url.hostname, nonce))){
			throw Error("Invalid password generator URL.");
		}
		tempdict.set("object.nonce", nonce);

		let serialized = tempdict.serialize();
		console.log(serialized);
		let seed = await digestAttributesDict.call(tempdict);
		
		let derive_by_rule = PasswordDeriveByRule.from_querystring(url.search);
		return await derive_by_rule.derive(seed);
	}



}

export default PasswordGenerator;