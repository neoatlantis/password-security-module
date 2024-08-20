import { check_value } from "app/attributes_def";


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
		this.#dict.set(key, value);
		return this;
	}

	clone(){
		let cloned = new AttributesDict();
		this.#dict.forEach((value, key)=>cloned.set(key, value));
		return cloned;
	}

	serialize(){
		// TODO deterministic serialization.
	}

}

export default AttributesDict;