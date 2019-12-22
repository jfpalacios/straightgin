import * as ph from 'pohlig-hellman';

const data = 'something to encrypt';

// create a cipher and encrypt the data with a random key
const cipher1 = await ph.createCipher();
const encrypted1 = cipher1.encrypt(data);