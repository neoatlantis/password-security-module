import crypto from "crypto";
import buffer from "buffer";
import { encode, decode } from "@msgpack/msgpack";

import { AttributesDict, digestAttributesDict } from "app/AttributesDict";
import { check_value } from "app/attributes_def";
import current_timeslice from "app/timeslice";



const subtle = crypto.subtle;

class Wrapper extends AttributesDict {

	#keys;

	constructor(namespace){
		super();

		this.set("psm.namespace", "");
		this.set("psm.special-object", "wrapper");
		this.lock();

		this.#keys = new Map();
	}

	async #get_key(timeslice){
		if(!check_value("time.slice", timeslice)){
			throw Error("Invalid time slice supplied.");
		}
		if(this.#keys.has(timeslice)) return this.#keys.get(timeslice);

		let secret = await digestAttributesDict.call(
			this.clone().set("time.slice", timeslice)
		);
		let truncated_secret = new Uint8Array(secret).slice(0, 32);

		this.#keys.set(timeslice, await subtle.importKey(
			'raw',
			truncated_secret,
			'AES-GCM',
			false,
			['encrypt', 'decrypt']
		));
		return this.#keys.get(timeslice);
	}

	async wrap(attributesDict){
		if(!attributesDict instanceof AttributesDict){
			throw Error("Expects an AttributesDict");
		}
		let serialized = attributesDict.serialize();
		let encoder = new TextEncoder();
		let buf = encoder.encode(serialized);
		let timeslice = current_timeslice();

		const iv = crypto.getRandomValues(new Uint8Array(12));
		const encrypted = new Uint8Array(await crypto.subtle.encrypt(
  			{ name: "AES-GCM", iv, tagLength: 128 },
  			await this.#get_key(timeslice),
  			buf
		));
		
		let encoded = encode(["v1", iv, timeslice, encrypted]);
		return buffer.Buffer.from(encoded).toString("base64");
	}

}



export default new Wrapper();