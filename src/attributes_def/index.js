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

function set_value(key, value){
	let convfunc = _.get(def, [key, "convert"]);
	if(_.isFunction(convfunc)) return convfunc(value);
	return value;
}

export { check_value, set_value };