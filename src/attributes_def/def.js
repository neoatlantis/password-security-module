import _ from "lodash";

const isASCIIString = (v)=>_.isString(v) && /^[\x20-\x7E]*$/.test(v);



export default {

	"psm.namespace": {
		verify: (v)=>isASCIIString(v),
	}






}