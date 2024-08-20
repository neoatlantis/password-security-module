import _ from "lodash";
var oracle = null;

export default function get_or_set(new_oracle){
	if(_.isNil(oracle)){
		if(!_.isNil(new_oracle)){
			oracle = new_oracle;
		} else {
			throw Error("Random oracle not initialized.");
		}
	}
	return oracle;
}