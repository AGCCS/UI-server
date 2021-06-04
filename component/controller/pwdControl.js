const crypto = require('crypto');

const algorithm = 'aes-192-cbc';
const encrypPWD = 'ojb109h'
const salt = 'nalk8n1'

const key = crypto.scryptSync(encrypPWD, salt, 24);
const iv = Buffer.alloc(16, '1no3o5axjp95mdl2');

function genPassword(password) {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = '';
    cipher.on('readable', () => {
        let chunk;
        while (null !== (chunk = cipher.read())) {
            encrypted += chunk.toString('hex');}
    });
    cipher.write(password);
    cipher.end();
    return encrypted
}

function pwdDecry (encryPWD) {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = '';
    decipher.on('readable', () => {
        while (null !== (chunk = decipher.read())) {
            decrypted += chunk.toString('utf8');
        }
    });
    decipher.write(encryPWD, 'hex');
    decipher.end();
    return decrypted
}

module.exports = {
    genPassword,
    pwdDecry
}
