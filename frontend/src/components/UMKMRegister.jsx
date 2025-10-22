import React, { useState } from 'react'; // <-- [PERBAIKAN] Memperbaiki kesalahan ketik 'aimport' menjadi 'import'
import { getFinalHash } from '../utils/hashing';
import { uploadFileToIPFS, uploadJSONToIPFS } from '../utils/ipfs';
import { toast } from 'react-toastify';

// Definisikan state awal di luar komponen agar bisa dipakai ulang untuk reset
const initialFormState = {
  // Bagian A: Identitas Pemilik
  namaLengkap: '',
  nik: '',
  
  // Bagian B: Legalitas Dasar Usaha
  namaUsaha: '',
  nib: '',
  alamatUsaha: '',

  // CID untuk file yang diunggah
  fileKTP_cid: '',
  fileNIB_cid: ''
};

const UMKMRegister = ({ onRegister }) => {
  const [form, setForm] = useState(initialFormState);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    if (files.length === 0) return;

    const file = files[0];
    const cidFieldName = `${name}_cid`; // Misal: 'fileKTP_cid'

    setIsUploading(true);
    toast.info(`Mengunggah ${file.name} ke IPFS...`);

    try {
      const cid = await uploadFileToIPFS(file);
      toast.success(`${file.name} berhasil diunggah!`);
      
      setForm(prev => ({ ...prev, [cidFieldName]: cid }));
    } catch (error) {
      toast.error(`Gagal mengunggah ${file.name}.`);
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const submit = async () => {
    if (isUploading) {
      return toast.warning('Harap tunggu proses upload file selesai.');
    }
    if (!form.namaLengkap || !form.nik || !form.namaUsaha || !form.nib || !form.fileKTP_cid || !form.fileNIB_cid) {
        return toast.error("Semua field wajib diisi, termasuk dokumen KTP dan NIB.");
    }

    setIsUploading(true);
    try {
      toast.info('Membuat paket pengajuan...');
      const submissionPackage = {
        version: '1.1',
        submittedAt: new Date().toISOString(),
        data: form,
      };

      const masterCid = await uploadJSONToIPFS(submissionPackage);
      toast.success(`Paket pengajuan berhasil dibuat di IPFS!`);

      const finalHash = getFinalHash(submissionPackage);

      // onRegister sekarang mengembalikan boolean
      const success = await onRegister({
        hash: finalHash,
        ipfsCid: masterCid,
        assetType: `NIB-${form.nib}`,
      });

      // Hanya reset form jika transaksi berhasil
      if (success) {
        setForm(initialFormState);
        toast.info("Formulir telah dibersihkan untuk pengajuan baru.");
      }
      
    } catch (error) {
      console.error("Gagal membuat paket pengajuan:", error);
      toast.error('Gagal memproses pengajuan.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-lg">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Formulir Pendaftaran Izin Usaha UMKM</h4>
            </div>
            <div className="card-body p-4">

              {/* Bagian A: Identitas Pemilik */}
              <h5 className="mb-3 border-bottom pb-2">Bagian A: Identitas Pemilik</h5>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Nama Lengkap (sesuai KTP)</label>
                  <input name="namaLengkap" className="form-control" value={form.namaLengkap} onChange={handleChange} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Nomor Induk Kependudukan (NIK)</label>
                  <input name="nik" type="number" className="form-control" value={form.nik} onChange={handleChange} />
                </div>
                <div className="col-md-12 mb-3">
                  <label className="form-label">Scan KTP (PDF/JPG/PNG)</label>
                  <input name="fileKTP" type="file" className="form-control" onChange={handleFileChange} />
                  {form.fileKTP_cid && <small className="text-success d-block mt-1">✓ KTP terunggah: {form.fileKTP_cid.substring(0,20)}...</small>}
                </div>
              </div>

              {/* Bagian B: Legalitas Dasar Usaha */}
              <h5 className="mb-3 mt-4 border-bottom pb-2">Bagian B: Legalitas Dasar Usaha</h5>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Nama Usaha/Toko</label>
                  <input name="namaUsaha" className="form-control" value={form.namaUsaha} onChange={handleChange} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Nomor Induk Berusaha (NIB)</label>
                  <input name="nib" type="number" className="form-control" value={form.nib} onChange={handleChange} />
                </div>
                <div className="col-md-12 mb-3">
                  <label className="form-label">Alamat Usaha</label>
                  <textarea name="alamatUsaha" className="form-control" value={form.alamatUsaha} onChange={handleChange} />
                </div>
                <div className="col-md-12 mb-3">
                  <label className="form-label">Dokumen NIB (PDF)</label>
                  <input name="fileNIB" type="file" className="form-control" onChange={handleFileChange} />
                   {form.fileNIB_cid && <small className="text-success d-block mt-1">✓ NIB terunggah: {form.fileNIB_cid.substring(0,20)}...</small>}
                </div>
              </div>

              <div className="d-grid gap-2 mt-4">
                <button className="btn btn-success btn-lg" onClick={submit} disabled={isUploading}>
                  {isUploading ? 'Memproses...' : 'Daftarkan Aset ke Blockchain'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UMKMRegister;

