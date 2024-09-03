import _ from "lodash";
import buffer from "buffer";

var oracle = null;

function wrap_oracle(oracle){
	return function(data){
		if(_.isString(data)) data = buffer.Buffer.from(data, "ascii");
		if(_.isTypedArray(data)) data = buffer.Buffer.from(data);

		if(!buffer.Buffer.isBuffer(data)) throw Error("Incompatiable data type.");
		return oracle(new Uint8Array(data));
	}
}


export default function get_or_set(new_oracle){
	if(_.isNil(oracle)){
		if(!_.isNil(new_oracle)){
			oracle = wrap_oracle(new_oracle);
		} else {
			throw Error("Random oracle not initialized.");
		}
	}
	return oracle;
}