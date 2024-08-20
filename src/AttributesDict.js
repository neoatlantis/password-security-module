import d_stringify from "json-stringify-deterministic";
import { check_value } from "app/attributes_def";
import get_oracle from "app/random_oracle";


class AttributesDict {

	#dict;
	#locked;
	constructor(){
		this.#dict = new Map();
		this.#locked = false;
	}

	lock(){
		this.#locked = true;
		return this;
	}

	set(key, value){
		if(this.#locked) throw Error("AttributesDict locked.");
		if(!check_value(key, value)){
			throw Error("Cannot set key " + key + " with given value.");
		}
		if(this.#dict.has(key)){
			throw Error("Key " + key + " is already set.");
		}
		this.#dict.set(key, value);
		return this;
	}

	clone(){
		let cloned = new AttributesDict();
		this.#dict.forEach((value, key)=>cloned.set(key, value));
		return cloned;
	}

	serialize(){
		let json = {};
		this.#dict.forEach((value,key)=>json[key]=value);
		return d_stringify(json);
	}
}


function digestAttributesDict(){
	let serialized = this.serialize();
	let encoder = new TextEncoder();
	let buf = encoder.encode(serialized);
	return get_oracle()(buf);
}



export { AttributesDict, digestAttributesDict };