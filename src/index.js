import _ from "lodash";
import set_oracle from "app/random_oracle";
import PSM from "app/psm";

export function init(asyncRandomOracle){

	if(!_.isFunction(asyncRandomOracle)){
		throw Error("Expects a random oracle function.");
	}
	
	set_oracle(asyncRandomOracle);

	return PSM;
}