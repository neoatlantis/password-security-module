import buf2ascii from "./buf2ascii.js";

export default function(buf){
    let cursor = 0;
    let m = 95;
    let offset = 33; // "!"

    let output_buf = new Uint8Array(buf.length);
    for(let i=0; i<buf.length; i++){
        cursor = (cursor + buf[i]) % m;
        output_buf[i] = offset+cursor;
    }

    return buf2ascii(output_buf);
}