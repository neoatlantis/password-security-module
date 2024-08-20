export default function current(){
	return Math.floor(
		new Date().getTime()/1000/86400/10
	);
}