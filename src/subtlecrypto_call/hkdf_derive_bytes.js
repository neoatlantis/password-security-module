const subtle = crypto.subtle;

export default async function({ key, algorithm, salt, info, bytes_length }){

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