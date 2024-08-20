import _ from "lodash";
import def from "./def";

function check_value(key, value){
	if(def[key] === undefined){
		throw Error("Invalid key:" + key);
	}

	let verify = _.get(def, [key, "verify"]);

	if(_.isFunction(verify)) return verify(value);
	return true;
}

export { check_value };