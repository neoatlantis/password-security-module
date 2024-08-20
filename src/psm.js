import AttributesDict from "app/AttributesDict";

class PSM extends AttributesDict {

	constructor(namespace){
		super();

		this.set("psm.namespace", namespace);
		this.lock();
	}

}

export default PSM;