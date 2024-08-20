import { AttributesDict, digestAttributesDict } from "app/AttributesDict";
import wrapper from "app/wrapper";

class PSM extends AttributesDict {

	constructor(namespace){
		super();

		this.set("psm.namespace", namespace);
		this.set("psm.special-object", "none");
		this.lock();
	}


	export(){
		return wrapper.wrap(this);
	}


}

export default PSM;