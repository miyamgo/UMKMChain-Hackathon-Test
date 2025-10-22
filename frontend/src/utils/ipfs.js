// [FILE BARU]
// PENTING: Simpan kunci ini di file .env.local di aplikasi production!
// Untuk hackathon, menaruhnya di sini sementara tidak apa-apa.
// Anda bisa mendapatkan JWT dari https://app.pinata.cloud/keys
const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyMWNhOGYzOS1kMWQxLTQzZmEtOTJlZC0xODAxYjIwZjk2NjAiLCJlbWFpbCI6Im5ld2V1bWlAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjZkZmQ4NzhjNDE5MmYzYTAxMGFjIiwic2NvcGVkS2V5U2VjcmV0IjoiZjQ5NjczZmJmYTQxOGQwOGVhZGY3OGVjMDJmM2U5YjcwNTYxMzAwZWI4MmVhNDUyMTRlZjA5ZDgwOGIyMGUwNSIsImV4cCI6MTc5MjQyNjE4MH0._1tL7VGRxW9qeqOJqcTF2ZSEDLqa1hq-vP4jsqZ5ok4';


// --- BAGIAN UPLOAD DATA KE IPFS ---

/**
 * Mengunggah file ke IPFS menggunakan layanan Pinata.
 * @param {File} file - File yang akan diunggah.
 * @returns {Promise<string>} - CID dari file yang diunggah.
 */
export const uploadFileToIPFS = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const metadata = JSON.stringify({ name: file.name });
  formData.append('pinataMetadata', metadata);

  const options = JSON.stringify({ cidVersion: 0 });
  formData.append('pinataOptions', options);

  try {
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`
      },
      body: formData,
    });
    if (!res.ok) {
        throw new Error(`Failed to upload to Pinata, status: ${res.status}`);
    }
    const resData = await res.json();
    console.log('File uploaded to IPFS:', resData);
    return resData.IpfsHash;
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw error;
  }
};

/**
 * Mengunggah objek JSON ke IPFS sebagai file.
 * @param {object} jsonObject - Objek JSON yang akan diunggah.
 * @returns {Promise<string>} - CID dari file JSON yang diunggah.
 */
export const uploadJSONToIPFS = async (jsonObject) => {
  const blob = new Blob([JSON.stringify(jsonObject, null, 2)], { type: 'application/json' });
  const file = new File([blob], 'submission.json');
  return await uploadFileToIPFS(file);
};


// --- BAGIAN MENGAMBIL DATA DARI IPFS ---

// Daftar IPFS gateway publik yang akan dicoba secara berurutan
const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/'
];

/**
 * Mengambil data dari IPFS dengan mencoba beberapa gateway secara berurutan.
 * @param {string} cid - Content Identifier (CID) dari file yang akan diambil.
 * @returns {Promise<object>} - Promise yang akan resolve dengan data JSON yang sudah di-parse.
 */
export const fetchFromIPFS = async (cid) => {
  for (const gateway of IPFS_GATEWAYS) {
    try {
      const response = await fetch(`${gateway}${cid}`);
      if (response.ok) {
        console.log(`Successfully fetched CID ${cid} from ${gateway}`);
        return await response.json();
      }
      console.warn(`Failed to fetch from ${gateway}, status: ${response.status}`);
    } catch (error) {
      console.warn(`Error fetching from ${gateway}:`, error.message);
    }
  }
  throw new Error(`Could not fetch CID ${cid} from any available IPFS gateway.`);
};
