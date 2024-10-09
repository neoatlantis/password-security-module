import _ from "lodash";

const isASCIIString = (v)=>_.isString(v) && /^[\x20-\x7E]*$/.test(v);
const isHEXString = (v)=>(
	_.isString(v) &&
	v.length % 2 == 0 &&
	/^[0-9a-f]*$/.test(v)
);



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
			"password-generator-nonce",
			"password-generator",
			"data-vault-nonce",
			"data-vault",
		], v),
	},

	"object.domain": {
		verify: (v)=>{
			return isASCIIString(v); // TODO more strict on this.
		},
		convert: (v)=>{
			return v.trim().toLowerCase();
		}
	},

	"object.nonce": {
		verify: (v)=>{
			return isHEXString(v) && v.length >= 32
		}
	},

	"object.data": {
		verify: (v)=>{
			return isHEXString(v)
		}
	},




}