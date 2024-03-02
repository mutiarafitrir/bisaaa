const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

const client = new Client({
    authStrategy: new LocalAuth()
});

async function sendData(qr) {
    try {
      const response = await axios.post('http://oryacargo.test/koneksi-wa', {
        qr_code: qr,
        // Anda bisa menambahkan lebih banyak data yang ingin dikirim
      });
  
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
    }
  }

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    sendData(qr);
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize();

const api = async (req, res) => {

    let nohp = req.query.nohp || req.body.nohp;
    const pesan = req.query.pesan || req.body.pesan;
    const gambar = req.query.gambar || req.body.gambar;

    // 62896897656@c.us

    try {

        if (nohp.startsWith("0")) {
            nohp = "62" + nohp.slice(1) + "@c.us";
        } else if (nohp.startsWith("62")) {
            nohp = nohp + "@c.us";
        } else {
            nohp = "62" + nohp + "@c.us";
        }

        const user = await client.isRegisteredUser(nohp);

        if (user) {

            if (gambar !== undefined && gambar !== null && gambar !== "") {
                let media = await MessageMedia.fromUrl(gambar, { unsafeMime: true });
                client.sendMessage(nohp, media, { caption: pesan });
                res.json({ status: "berhasil terkirim", pesan: media.filename });
            } else {
                client.sendMessage(nohp, pesan);
                res.json({ status: "berhasil terkirim", pesan });
            }
        } else {
            res.json({ status: "gagal", pesan: "nomor wa tidak terdaftar" });
        }

    } catch (error) {

        console.log(error)
        res.status(500).json({ status: "error", pesan: "error server" });
    }


};

module.exports = api;