import get_crypto from "./crypto_api";

export default async function({ key, algorithm, salt, info, bytes_length }){
	const subtle = get_crypto().subtle;

	const secret_key = await subtle.importKey(
		'raw',
		key,
		'HKDF',
		false,
		['deriveBits']
	);

	const params = {
		name: 'HKDF',
		hash: algorithm,
		salt,
		info,
	};

	return subtle.deriveBits(
		params,
		secret_key,
		bytes_length*8
	);
}