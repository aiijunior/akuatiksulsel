import React from 'react';
import { Referee } from '../types';
import { APP_TITLE } from '../config';
import { ArrowLeftIcon } from './icons';

interface RefereePrintViewProps {
  referee: Referee;
  onBack: () => void;
  logoUrl: string | null;
}

const DetailItem: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
    <p className="text-sm text-slate-800">{value || '-'}</p>
  </div>
);

export const RefereePrintView: React.FC<RefereePrintViewProps> = ({ referee, onBack, logoUrl }) => {
  const {
    name, photoUrl, licenseNumber, gender,
    placeOfBirth, dateOfBirth, address,
    phone, email, highestLicense, sportBranch, experience
  } = referee;

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto font-sans relative overflow-hidden print-container">
        {logoUrl && (
            <div className="watermark">
                <img src={logoUrl} alt="Watermark Logo" />
            </div>
        )}
        <div className="relative z-10">
          <header className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-200 transition-colors no-print" title="Kembali ke Dasbor">
                    <ArrowLeftIcon className="w-6 h-6 text-slate-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Data Pribadi Wasit</h1>
                  <p className="text-slate-600">{APP_TITLE}</p>
                </div>
            </div>
            <div className="text-right">
                {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-16 w-auto"/>
                ) : (
                    <svg className="w-16 h-16 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                )}
            </div>
          </header>

          <main className="mt-8">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-4">
                <img src={photoUrl} alt={`Foto ${name}`} className="w-full h-auto object-cover rounded-lg shadow-md border-4 border-white" />
              </div>
              <div className="col-span-8">
                <h2 className="text-3xl font-bold text-blue-800">{name}</h2>
                <p className="text-md font-medium text-slate-500 mb-6">Nomor Lisensi: {licenseNumber || '-'}</p>
                
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <DetailItem label="Jenis Kelamin" value={gender === 'L' ? 'Laki-laki' : 'Perempuan'} />
                  <DetailItem label="Tempat, Tanggal Lahir" value={`${placeOfBirth}, ${dateOfBirth}`} />
                  <DetailItem label="Nomor Telepon" value={phone} />
                  <DetailItem label="Email" value={email} />
                  <div className="col-span-2">
                    <DetailItem label="Alamat" value={address} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-200">
              <h3 className="text-xl font-bold text-slate-700 mb-4">Informasi Lisensi Wasit</h3>
              <div className="grid grid-cols-2 gap-6 bg-slate-50/70 p-4 rounded-lg">
                <DetailItem label="Lisensi Tertinggi" value={highestLicense} />
                <DetailItem label="Cabang Olahraga" value={sportBranch} />
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-xl font-bold text-slate-700 mb-4">Pengalaman Bertugas</h3>
               {experience && experience.length > 0 ? (
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                    {experience.map((exp, index) => (
                        <li key={index}>{exp}</li>
                    ))}
                </ul>
               ) : (
                 <p className="text-slate-500">Belum ada data pengalaman yang dicatat.</p>
               )}
            </div>
          </main>

           <footer className="mt-12 pt-4 text-center text-xs text-slate-400 border-t border-slate-200">
              <p>Dokumen ini dicetak pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}.</p>
              <p>{APP_TITLE} &copy; {new Date().getFullYear()}</p>
            </footer>
        </div>
    </div>
  );
};
