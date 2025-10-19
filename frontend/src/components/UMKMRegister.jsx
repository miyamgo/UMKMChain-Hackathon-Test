import React, { useState } from 'react';
import { getFinalHash } from '../utils/hashing';

// UMKM registration form matching government-standard sections A-D
const emptyFile = { name: '', data: '' };

const UMKMRegister = ({ onRegister }) => {
  const [form, setForm] = useState({
    // A. Data Pelaku Usaha
    namaLengkap: '',
    nik: '',
    npwpPribadi: '',
    alamatKTP: '',
    rtRw: '',
    kelurahan: '',
    kecamatan: '',
    kotaKab: '',
    provinsi: '',
    kodePos: '',
    alamatDomisili: '',
    contactPhone: '',
    contactEmail: '',

    // B. Data Usaha
    namaUsaha: '',
    nib: '',
    bentukBadan: 'Perorangan',
    skalaUsaha: 'Mikro',
    sektorUsaha: '',
    alamatUsaha: '',
    tahunBerdiri: '',
    jumlahTenagaKerja: '',
    kisaranOmzet: '',

    // C. Legalitas (files stored as {name, data})
    fileNIB: emptyFile,
    fileIUMK: emptyFile,
    fileSIUP: emptyFile,
    fileNPWPBadan: emptyFile,
    fileSertifikatHalal: emptyFile,
    fileBPOM: emptyFile,
    fileSertifikatMerek: emptyFile,

    // D. Status & Hak Tanah
    statusKepemilikan: 'Milik Sendiri',
    fileSHM: emptyFile,
    fileAJB: emptyFile,
    filePBB: emptyFile,
    filePerjanjianSewa: emptyFile,
    fileSuratPernyataan: emptyFile,
    fileKTPPemilikTempat: emptyFile,
    imb: emptyFile,

    // lokasi koordinat
    landLat: '',
    landLng: '',

    // misc
    additionalNotes: ''
  });

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setField(name, value);
  };

  const readFile = (file, cb) => {
    if (!file) return cb(emptyFile);
    const reader = new FileReader();
    reader.onload = () => cb({ name: file.name, data: reader.result });
    reader.onerror = () => cb({ name: file.name, data: '' });
    reader.readAsDataURL(file);
  };

  const handleFile = (e) => {
    const { name, files } = e.target;
    const f = files && files[0];
    if (!f) {
      setField(name, emptyFile);
      return;
    }
    readFile(f, (fileObj) => setField(name, fileObj));
  };

  const validate = () => {
    const errors = [];
    // A: required identity
    if (!form.namaLengkap || !form.namaLengkap.trim()) errors.push('Nama Lengkap');
    if (!form.nik || String(form.nik).trim().length !== 16) errors.push('NIK (16 digit)');
    if (!form.contactPhone || !form.contactPhone.trim()) errors.push('Nomor Telepon');
    if (!form.contactEmail || !form.contactEmail.trim()) errors.push('Email');

    // B: business required
    if (!form.namaUsaha || !form.namaUsaha.trim()) errors.push('Nama Usaha');
    if (!form.nib || !form.nib.trim()) errors.push('NIB (disarankan)');

    // D: ownership status - recommend uploading documents, but not strictly required

    return errors;
  };

  const submit = () => {
    const errors = validate();
    if (errors.length > 0) {
      alert('Field wajib atau format salah:\n' + errors.join('\n'));
      return;
    }

    // normalize for hashing
    const hashInput = {
      namaLengkap: form.namaLengkap,
      nik: form.nik,
      npwpPribadi: form.npwpPribadi,
      alamatKTP: form.alamatKTP,
      rtRw: form.rtRw,
      kelurahan: form.kelurahan,
      kecamatan: form.kecamatan,
      kotaKab: form.kotaKab,
      provinsi: form.provinsi,
      kodePos: form.kodePos,
      alamatDomisili: form.alamatDomisili,

      namaUsaha: form.namaUsaha,
      nib: form.nib,
      bentukBadan: form.bentukBadan,
      skalaUsaha: form.skalaUsaha,
      sektorUsaha: form.sektorUsaha,
      alamatUsaha: form.alamatUsaha,
      tahunBerdiri: form.tahunBerdiri,
      jumlahTenagaKerja: form.jumlahTenagaKerja,
      kisaranOmzet: form.kisaranOmzet,

      // files - include file data (base64) to make hash reflect content when present
      fileNIB: form.fileNIB.data,
      fileIUMK: form.fileIUMK.data,
      fileSIUP: form.fileSIUP.data,
      fileNPWPBadan: form.fileNPWPBadan.data,
      fileSertifikatHalal: form.fileSertifikatHalal.data,
      fileBPOM: form.fileBPOM.data,
      fileSertifikatMerek: form.fileSertifikatMerek.data,

      statusKepemilikan: form.statusKepemilikan,
      fileSHM: form.fileSHM.data,
      fileAJB: form.fileAJB.data,
      filePBB: form.filePBB.data,
      filePerjanjianSewa: form.filePerjanjianSewa.data,
      fileSuratPernyataan: form.fileSuratPernyataan.data,
      fileKTPPemilikTempat: form.fileKTPPemilikTempat.data,
      imb: form.imb.data,

      landLat: form.landLat,
      landLng: form.landLng,

      contactPhone: form.contactPhone,
      contactEmail: form.contactEmail,
      additionalNotes: form.additionalNotes
    };

    const hash = getFinalHash(hashInput);
    const payload = { ...form, hash, createdAt: Date.now() };
    onRegister(payload);
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">Form Pendaftaran UMKM (Standar Pemerintah)</div>
            <div className="card-body">

              {/* A. Data Pelaku Usaha */}
              <h6>Bagian A — Data Pelaku Usaha</h6>
              <div className="mb-3">
                <label className="form-label">Nama Lengkap (sesuai KTP) <span className="text-danger">*</span></label>
                <input name="namaLengkap" className="form-control" value={form.namaLengkap} onChange={handleChange} />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">NIK (16 digit) <span className="text-danger">*</span></label>
                  <input name="nik" className="form-control" value={form.nik} onChange={handleChange} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">NPWP Pribadi</label>
                  <input name="npwpPribadi" className="form-control" value={form.npwpPribadi} onChange={handleChange} />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Alamat Sesuai KTP</label>
                <input name="alamatKTP" className="form-control" value={form.alamatKTP} onChange={handleChange} />
              </div>

              <div className="row">
                <div className="col-md-4 mb-3"><input name="rtRw" className="form-control" placeholder="RT/RW" value={form.rtRw} onChange={handleChange} /></div>
                <div className="col-md-4 mb-3"><input name="kelurahan" className="form-control" placeholder="Kelurahan" value={form.kelurahan} onChange={handleChange} /></div>
                <div className="col-md-4 mb-3"><input name="kecamatan" className="form-control" placeholder="Kecamatan" value={form.kecamatan} onChange={handleChange} /></div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3"><input name="kotaKab" className="form-control" placeholder="Kota/Kab" value={form.kotaKab} onChange={handleChange} /></div>
                <div className="col-md-4 mb-3"><input name="provinsi" className="form-control" placeholder="Provinsi" value={form.provinsi} onChange={handleChange} /></div>
                <div className="col-md-4 mb-3"><input name="kodePos" className="form-control" placeholder="Kode Pos" value={form.kodePos} onChange={handleChange} /></div>
              </div>

              <div className="mb-3">
                <label className="form-label">Alamat Domisili (jika berbeda)</label>
                <input name="alamatDomisili" className="form-control" value={form.alamatDomisili} onChange={handleChange} />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3"><label className="form-label">Nomor Telepon/HP <span className="text-danger">*</span></label><input name="contactPhone" className="form-control" value={form.contactPhone} onChange={handleChange} /></div>
                <div className="col-md-6 mb-3"><label className="form-label">Alamat Email <span className="text-danger">*</span></label><input name="contactEmail" className="form-control" value={form.contactEmail} onChange={handleChange} /></div>
              </div>

              <hr />
              {/* B. Data Usaha */}
              <h6>Bagian B — Data Usaha/Bisnis</h6>
              <div className="mb-3">
                <label className="form-label">Nama Usaha / Merek Dagang <span className="text-danger">*</span></label>
                <input name="namaUsaha" className="form-control" value={form.namaUsaha} onChange={handleChange} />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Nomor Induk Berusaha (NIB) <span className="text-danger">*</span></label>
                  <input name="nib" className="form-control" value={form.nib} onChange={handleChange} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Bentuk Badan Usaha</label>
                  <select name="bentukBadan" className="form-select" value={form.bentukBadan} onChange={handleChange}>
                    <option>Perorangan</option>
                    <option>CV</option>
                    <option>PT</option>
                    <option>Koperasi</option>
                    <option>Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Skala Usaha</label>
                  <select name="skalaUsaha" className="form-select" value={form.skalaUsaha} onChange={handleChange}>
                    <option>Mikro</option>
                    <option>Kecil</option>
                    <option>Menengah</option>
                  </select>
                </div>
                <div className="col-md-4 mb-3"><label className="form-label">Tahun Berdiri</label><input name="tahunBerdiri" className="form-control" value={form.tahunBerdiri} onChange={handleChange} /></div>
                <div className="col-md-4 mb-3"><label className="form-label">Jumlah Tenaga Kerja</label><input name="jumlahTenagaKerja" className="form-control" value={form.jumlahTenagaKerja} onChange={handleChange} /></div>
              </div>

              <div className="mb-3"><label className="form-label">Sektor / KBLI</label><input name="sektorUsaha" className="form-control" value={form.sektorUsaha} onChange={handleChange} /></div>
              <div className="mb-3"><label className="form-label">Alamat Tempat Usaha</label><input name="alamatUsaha" className="form-control" value={form.alamatUsaha} onChange={handleChange} /></div>
              <div className="mb-3"><label className="form-label">Kisaran Omzet Tahunan</label><input name="kisaranOmzet" className="form-control" value={form.kisaranOmzet} onChange={handleChange} /></div>

              <hr />
              {/* C. Legalitas (upload) */}
              <h6>Bagian C — Legalitas Usaha (Upload Dokumen jika ada)</h6>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Upload NIB (PDF / gambar)</label>
                  <input type="file" name="fileNIB" className="form-control" onChange={handleFile} />
                  <small className="text-muted">{form.fileNIB.name}</small>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Upload IUMK / Izin Usaha</label>
                  <input type="file" name="fileIUMK" className="form-control" onChange={handleFile} />
                  <small className="text-muted">{form.fileIUMK.name}</small>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Upload SIUP</label>
                  <input type="file" name="fileSIUP" className="form-control" onChange={handleFile} />
                  <small className="text-muted">{form.fileSIUP.name}</small>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Upload NPWP Badan (jika ada)</label>
                  <input type="file" name="fileNPWPBadan" className="form-control" onChange={handleFile} />
                  <small className="text-muted">{form.fileNPWPBadan.name}</small>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Sertifikat Halal</label>
                  <input type="file" name="fileSertifikatHalal" className="form-control" onChange={handleFile} />
                  <small className="text-muted">{form.fileSertifikatHalal.name}</small>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Izin Edar BPOM / PIRT</label>
                  <input type="file" name="fileBPOM" className="form-control" onChange={handleFile} />
                  <small className="text-muted">{form.fileBPOM.name}</small>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Sertifikat Merek (jika ada)</label>
                <input type="file" name="fileSertifikatMerek" className="form-control" onChange={handleFile} />
                <small className="text-muted">{form.fileSertifikatMerek.name}</small>
              </div>

              <hr />
              {/* D. Status & Hak Atas Tanah */}
              <h6>Bagian D — Status & Hak Atas Tanah / Tempat Usaha</h6>
              <div className="mb-3">
                <label className="form-label">Status Kepemilikan</label>
                <select name="statusKepemilikan" className="form-select" value={form.statusKepemilikan} onChange={handleChange}>
                  <option>Milik Sendiri</option>
                  <option>Sewa / Kontrak</option>
                  <option>Pinjam Pakai</option>
                  <option>Milik Keluarga</option>
                </select>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Upload SHM / HGB (jika Milik Sendiri)</label>
                  <input type="file" name="fileSHM" className="form-control" onChange={handleFile} />
                  <small className="text-muted">{form.fileSHM.name}</small>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Upload AJB / Bukti Jual Beli</label>
                  <input type="file" name="fileAJB" className="form-control" onChange={handleFile} />
                  <small className="text-muted">{form.fileAJB.name}</small>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3"><label className="form-label">Upload PBB (terakhir)</label><input type="file" name="filePBB" className="form-control" onChange={handleFile} /><small className="text-muted">{form.filePBB.name}</small></div>
                <div className="col-md-6 mb-3"><label className="form-label">Perjanjian Sewa (jika sewa)</label><input type="file" name="filePerjanjianSewa" className="form-control" onChange={handleFile} /><small className="text-muted">{form.filePerjanjianSewa.name}</small></div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3"><label className="form-label">Surat Pernyataan (jika pinjam pakai)</label><input type="file" name="fileSuratPernyataan" className="form-control" onChange={handleFile} /><small className="text-muted">{form.fileSuratPernyataan.name}</small></div>
                <div className="col-md-6 mb-3"><label className="form-label">KTP Pemilik Tempat</label><input type="file" name="fileKTPPemilikTempat" className="form-control" onChange={handleFile} /><small className="text-muted">{form.fileKTPPemilikTempat.name}</small></div>
              </div>

              <div className="mb-3"><label className="form-label">IMB / PBG (jika ada)</label><input type="file" name="imb" className="form-control" onChange={handleFile} /><small className="text-muted">{form.imb.name}</small></div>

              <div className="row">
                <div className="col-md-6 mb-3"><label className="form-label">Koordinat Tanah - Lat</label><input name="landLat" className="form-control" value={form.landLat} onChange={handleChange} /></div>
                <div className="col-md-6 mb-3"><label className="form-label">Koordinat Tanah - Lng</label><input name="landLng" className="form-control" value={form.landLng} onChange={handleChange} /></div>
              </div>

              <div className="mb-3"><label className="form-label">Catatan Tambahan</label><textarea name="additionalNotes" className="form-control" value={form.additionalNotes} onChange={handleChange} /></div>

              <div className="d-grid gap-2">
                <button className="btn btn-success" onClick={submit}>Daftar & Generate Hash</button>
              </div>

            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow">
            <div className="card-header bg-light">Panduan Form Pemerintah</div>
            <div className="card-body small">
              <p><strong>Bagian A</strong> — Identitas pemilik (KTP, NIK, NPWP pribadi).</p>
              <p><strong>Bagian B</strong> — Data usaha: NIB sangat direkomendasikan dan biasanya wajib untuk mendapat izin tertentu.</p>
              <p><strong>Bagian C</strong> — Upload dokumen legalitas (NIB, IUMK, SIUP, NPWP badan, sertifikat halal, BPOM, merek).</p>
              <p><strong>Bagian D</strong> — Status hak atas tanah; jika milik sendiri lampirkan SHM/HGB; jika sewa lampirkan perjanjian.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UMKMRegister;
