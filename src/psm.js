import { AttributesDict, digestAttributesDict } from "app/AttributesDict";
import wrapper from "app/wrapper";
import PasswordGenerator from "app/password_generator";
import DataVault from "app/data_vault";

class PSM extends AttributesDict {

	constructor(namespace){
		super();

		this.set("psm.namespace", namespace);
		this.set("psm.special-object", "none");
		this.lock();
	}

	get_password_generator(){
		return new PasswordGenerator(this.clone());
	}

	get_data_vault(){
		return new DataVault(this.clone());
	}

	export(){
		return wrapper.wrap(this);
	}


}

export default PSM;