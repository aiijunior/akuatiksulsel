import React from 'react';
import { Referee } from '../types';
import { APP_TITLE } from '../config';
import { ArrowLeftIcon, PrintIcon } from './icons';

interface BusinessCardPageProps {
  referees: Referee[];
  logoUrl: string | null;
  onBackToAdmin: () => void;
}

const BusinessCard: React.FC<{ referee: Referee, logoUrl: string | null }> = ({ referee, logoUrl }) => {
  const qrData = `MECARD:N:${referee.name};TEL:${referee.phone};EMAIL:${referee.email};NOTE:${referee.highestLicense} - ${referee.sportBranch};;`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrData)}&qzone=1`;

  return (
    <div className="card-wrapper">
      {/* Front Side */}
      <div className="business-card card-front bg-blue-800 text-white flex flex-col justify-center items-center p-4 text-center">
        {logoUrl && (
          <img src={logoUrl} alt="Logo" className="h-14 mx-auto mb-3" />
        )}
        <h3 className="text-lg font-bold">{referee.name}</h3>
        <p className="text-xs text-blue-200 mt-1">Wasit Akuatik</p>
      </div>
      {/* Back Side */}
      <div className="business-card card-back bg-white p-3 flex flex-col">
        <div className="flex items-center gap-3 border-b pb-2 mb-2">
            <img src={referee.photoUrl} alt={referee.name} className="w-14 h-14 rounded-full object-cover border-2 border-blue-100"/>
            <div>
                <h4 className="font-bold text-slate-800 text-sm leading-tight">{referee.name}</h4>
                <p className="text-xs text-slate-500">{referee.highestLicense}</p>
                <p className="text-xs text-slate-500">{referee.sportBranch}</p>
            </div>
        </div>
        <div className="flex-grow flex items-center">
            <div className="text-[10px] space-y-1 text-slate-700 flex-grow">
                <p><strong>Telp:</strong> {referee.phone}</p>
                <p><strong>Email:</strong> {referee.email}</p>
                 <p><strong>Alamat:</strong> {referee.address}</p>
            </div>
            <div className="flex-shrink-0">
                <img src={qrCodeUrl} alt="QR Code Kontak" className="w-16 h-16" title="Pindai untuk simpan kontak" />
            </div>
        </div>
        <p className="text-[8px] text-center text-slate-400 mt-1">{APP_TITLE}</p>
      </div>
    </div>
  );
};


export const BusinessCardPage: React.FC<BusinessCardPageProps> = ({ referees, logoUrl, onBackToAdmin }) => {
  return (
    <div>
      <div className="bg-slate-50 p-4 sticky top-0 z-20 shadow no-print">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Cetak Kartu Nama Wasit</h1>
            <p className="text-sm text-slate-600">Halaman ini diformat untuk dicetak pada kertas A4.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onBackToAdmin} className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors">
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Kembali ke Dasbor</span>
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
              <PrintIcon className="w-5 h-5" />
              <span>Cetak Halaman</span>
            </button>
          </div>
        </div>
      </div>
      <div className="business-card-grid container mx-auto">
        {referees.map(referee => (
          <BusinessCard key={referee.id} referee={referee} logoUrl={logoUrl} />
        ))}
         {referees.length === 0 && (
            <div className="col-span-full text-center py-20 text-slate-500 no-print">
                Tidak ada data wasit untuk ditampilkan.
            </div>
        )}
      </div>
    </div>
  );
};