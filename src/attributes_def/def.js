import _ from "lodash";

const isASCIIString = (v)=>_.isString(v) && /^[\x20-\x7E]*$/.test(v);



export default {

	"time.slice": {
		verify: (v)=>{
			return _.isInteger(v) && _.isFinite(v) && v > 0;
		}
	},

	"psm.namespace": {
		verify: (v)=>isASCIIString(v),
	},

	"psm.special-object": {
		verify: (v)=>_.includes([
			"none",
			"wrapper",
		], v),
	},

	"object.type": {
		verify: (v)=>_.includes([
			"password-plain",
			"password-seed",
		], v),
	},

	"object.domain": {
		verify: (v)=>{
			return isASCIIString(v); // TODO more strict on this.
		}
	}






}