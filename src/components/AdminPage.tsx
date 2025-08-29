import React, { useState, useMemo, useEffect } from 'react';
import { Referee } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, PrintIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, IdCardIcon, ArrowUturnLeftIcon, Cog6ToothIcon, PhotoIcon } from './icons';
import { RefereeFormModal, ConfirmationModal, DeleteAllConfirmationModal, RestoreBackupModal } from './modals';
import { LICENSE_LEVELS, SPORT_BRANCHES } from '../config';
import { RefereePrintView } from './RefereePrintView';
import * as XLSX from 'xlsx';


interface AdminPageProps {
  referees: Referee[];
  onAddReferee: (referee: Omit<Referee, 'id'>) => Promise<void>;
  onUpdateReferee: (referee: Referee) => void;
  onDeleteReferee: (id: string) => void;
  onDeleteAllReferees: () => void;
  onAddMultipleReferees: (referees: Omit<Referee, 'id'>[]) => Promise<void>;
  onRestoreData: (referees: Referee[]) => void;
  onBackToHome: () => void;
  logoUrl: string | null;
  onLogoChange: (logoUrl: string | null) => void;
  onGoToBusinessCards: () => void;
  dbStatus: 'connecting' | 'connected' | 'error';
  adminEmail: string | null;
}

const DatabaseStatusIndicator: React.FC<{ status: 'connecting' | 'connected' | 'error' }> = ({ status }) => {
    const statusMap = {
        connecting: { text: 'DB Connecting...', color: 'bg-yellow-400', textColor: 'text-yellow-800', pulse: true },
        connected: { text: 'DB Connected', color: 'bg-green-400', textColor: 'text-green-800', pulse: false },
        error: { text: 'DB Connection Failed', color: 'bg-red-400', textColor: 'text-red-800', pulse: false },
    };

    const { text, color, textColor, pulse } = statusMap[status];

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${color} ${textColor}`}>
            <span className="relative flex h-2 w-2">
                {pulse && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}></span>}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${color} border border-current`}></span>
            </span>
            <span>{text}</span>
        </div>
    );
};

const AdminPage: React.FC<AdminPageProps> = ({ referees, onAddReferee, onUpdateReferee, onDeleteReferee, onDeleteAllReferees, onAddMultipleReferees, onRestoreData, onBackToHome, logoUrl, onLogoChange, onGoToBusinessCards, dbStatus, adminEmail }) => {
  const [activeTab, setActiveTab] = useState<'manage' | 'print' | 'settings'>('manage');
  const [manageMode, setManageMode] = useState<'manual' | 'bulk'>('manual');
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setDeleteAllModalOpen] = useState(false);
  const [isRestoreModalOpen, setRestoreModalOpen] = useState(false);
  const [dataToRestore, setDataToRestore] = useState<Referee[] | null>(null);
  const [refereeToEdit, setRefereeToEdit] = useState<Referee | null>(null);
  const [refereeToDelete, setRefereeToDelete] = useState<string | null>(null);
  const [refereeToPrint, setRefereeToPrint] = useState<Referee | null>(null);
  const [importStatus, setImportStatus] = useState<{ loading: boolean; message: string; type: 'success' | 'error' | 'info' }>({ loading: false, message: '', type: 'info'});
  const [fileName, setFileName] = useState('');


  useEffect(() => {
    if (refereeToPrint) {
        // Small timeout to allow React to render the print view before the print dialog opens
        const timer = setTimeout(() => {
            window.print();
        }, 100);

        const handleAfterPrint = () => {
            setRefereeToPrint(null);
        };
        
        window.addEventListener('afterprint', handleAfterPrint, { once: true });
        
        return () => {
            clearTimeout(timer);
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }
  }, [refereeToPrint]);

  const handleAddNew = () => {
    setRefereeToEdit(null);
    setFormModalOpen(true);
  };

  const handleEdit = (referee: Referee) => {
    setRefereeToEdit(referee);
    setFormModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setRefereeToDelete(id);
    setConfirmDeleteModalOpen(true);
  };

  const handlePrintReferee = (referee: Referee) => {
    setRefereeToPrint(referee);
  };
  
  const confirmDelete = () => {
    if (refereeToDelete) {
        onDeleteReferee(refereeToDelete);
    }
    setConfirmDeleteModalOpen(false);
    setRefereeToDelete(null);
  };

  const confirmDeleteAll = () => {
    onDeleteAllReferees();
    setDeleteAllModalOpen(false);
  };

  const handleFormSubmit = (refereeData: Omit<Referee, 'id'> | Referee) => {
    if ('id' in refereeData) {
        onUpdateReferee(refereeData);
    } else {
        onAddReferee(refereeData);
    }
    setFormModalOpen(false);
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        onLogoChange(reader.result as string);
    };
    reader.readAsDataURL(file);
    event.target.value = ''; // Reset file input
  };

  const handleBackupData = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(referees, null, 2)
    )}`;
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.href = jsonString;
    link.download = `backup_data_wasit_${timestamp}.json`;
    link.click();
  };
  
  const handleBackupDataExcel = () => {
    const dataForExport = referees.map(ref => ({
      "Nama": ref.name,
      "Gender (L/P)": ref.gender,
      "Tempat Lahir": ref.placeOfBirth,
      "Tanggal Lahir": ref.dateOfBirth,
      "Alamat": ref.address,
      "No HP": ref.phone,
      "Email": ref.email,
      "Nomor Lisensi": ref.licenseNumber,
      "Lisensi Tertinggi": ref.highestLicense,
      "Cabang Olahraga": ref.sportBranch,
      "Pengalaman 1": ref.experience[0] || '',
      "Pengalaman 2": ref.experience[1] || '',
      "Pengalaman 3": ref.experience[2] || '',
      "Pengalaman 4": ref.experience[3] || '',
      "Pengalaman 5": ref.experience[4] || '',
      "URL Foto": ref.photoUrl,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Wasit");

    const cols = [
        { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 15 }, 
        { wch: 25 }, { wch: 20 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, 
        { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 30 }
    ];
    worksheet['!cols'] = cols;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    XLSX.writeFile(workbook, `backup_data_wasit_${timestamp}.xlsx`);
  };

  const handleDownloadTemplate = () => {
      // 1. Buat sheet utama dengan contoh data
      const headers = [
          "Nama", "Gender (L/P)", "Tempat Lahir", "Tanggal Lahir", "Alamat", "No HP", "Email",
          "Nomor Lisensi", "Lisensi Tertinggi", "Cabang Olahraga",
          "Pengalaman 1", "Pengalaman 2", "Pengalaman 3", "Pengalaman 4", "Pengalaman 5",
          "URL Foto"
      ];
      const exampleData = [{
          "Nama": "Contoh Nama Wasit",
          "Gender (L/P)": "L",
          "Tempat Lahir": "Makassar",
          "Tanggal Lahir": "1995-01-30",
          "Alamat": "Jl. Contoh No. 123, Kota Contoh",
          "No HP": "081298765432",
          "Email": "contoh.wasit@email.com",
          "Nomor Lisensi": "SS-999-2024",
          "Lisensi Tertinggi": "Lisensi D (Daerah/Lokal)",
          "Cabang Olahraga": "Renang",
          "Pengalaman 1": "Kejurda 2023",
          "Pengalaman 2": "",
          "Pengalaman 3": "",
          "Pengalaman 4": "",
          "Pengalaman 5": "",
          "URL Foto": "https://example.com/foto_wasit.jpg"
      }];

      const mainWorksheet = XLSX.utils.json_to_sheet(exampleData, { header: headers });
      const mainCols = [
          { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 15 }, 
          { wch: 25 }, { wch: 20 }, { wch: 30 }, { wch: 30 }, { wch: 25 }, { wch: 25 }, 
          { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 30 }
      ];
      mainWorksheet['!cols'] = mainCols;

      // 2. Buat sheet petunjuk dengan pilihan yang valid
      const instructionsHeader = ["Kolom", "Pilihan yang Valid (Salin-tempel salah satu nilai ini)"];
      const instructionsData = [
          instructionsHeader,
          [], // Spasi
          ["Lisensi Tertinggi"],
          ...LICENSE_LEVELS.map(level => ["", level]),
          [], // Spasi
          ["Cabang Olahraga"],
          ...SPORT_BRANCHES.map(branch => ["", branch])
      ];

      const instructionsWorksheet = XLSX.utils.aoa_to_sheet(instructionsData);
      const instructionCols = [{ wch: 20 }, { wch: 40 }];
      instructionsWorksheet['!cols'] = instructionCols;

      // 3. Gabungkan sheet ke dalam satu workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, mainWorksheet, "Template Data Wasit");
      XLSX.utils.book_append_sheet(workbook, instructionsWorksheet, "Pilihan Isian");

      // 4. Unduh file
      XLSX.writeFile(workbook, "Template_Unggah_Massal_Wasit.xlsx");
  };
  
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportStatus({ loading: true, message: 'Memproses file...', type: 'info' });

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array', cellDates: true });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json: any[] = XLSX.utils.sheet_to_json(worksheet);

            const newReferees: Omit<Referee, 'id'>[] = json.map((row, index) => {
                 if (!row['Nama'] || !row['Gender (L/P)']) {
                    throw new Error(`Data tidak lengkap pada baris ${index + 2}. 'Nama' dan 'Gender (L/P)' wajib diisi.`);
                }
                
                const formatDate = (excelDate: any): string => {
                    if (!excelDate) return '';

                    if (excelDate instanceof Date) {
                        const year = excelDate.getFullYear();
                        const month = String(excelDate.getMonth() + 1).padStart(2, '0');
                        const day = String(excelDate.getDate()).padStart(2, '0');
                        return `${year}-${month}-${day}`;
                    }

                    if (typeof excelDate === 'number') {
                        // Handle Excel serial date number
                        const jsDate = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
                        return jsDate.toISOString().split('T')[0];
                    }
                    
                    if (typeof excelDate === 'string') {
                        // Assume it's already in a good format, or let the DB validate
                        return excelDate;
                    }
                    
                    throw new Error(`Format tanggal tidak dikenal pada baris ${index + 2}.`);
                };

                const experience = [
                    row['Pengalaman 1'],
                    row['Pengalaman 2'],
                    row['Pengalaman 3'],
                    row['Pengalaman 4'],
                    row['Pengalaman 5'],
                ].filter(exp => exp);

                return {
                    name: row['Nama'],
                    gender: row['Gender (L/P)']?.toUpperCase() === 'P' ? 'P' : 'L',
                    placeOfBirth: row['Tempat Lahir'] || '',
                    dateOfBirth: formatDate(row['Tanggal Lahir']),
                    address: row['Alamat'] || '',
                    phone: String(row['No HP'] || ''),
                    email: row['Email'] || '',
                    licenseNumber: row['Nomor Lisensi'] || '',
                    highestLicense: row['Lisensi Tertinggi'] || LICENSE_LEVELS[0],
                    sportBranch: row['Cabang Olahraga'] || SPORT_BRANCHES[0],
                    experience: experience,
                    photoUrl: row['URL Foto'] || `https://picsum.photos/seed/${row['Nama'] || Math.random()}/400`,
                };
            });
            
            await onAddMultipleReferees(newReferees);

            setImportStatus({ loading: false, message: `Berhasil mengimpor ${newReferees.length} data wasit.`, type: 'success' });

        } catch (error: any) {
            console.error(error);
            const errorMessage = error.message || 'Terjadi kesalahan tidak dikenal.';
            setImportStatus({ loading: false, message: `Gagal mengimpor: ${errorMessage}`, type: 'error' });
        } finally {
            // Reset file input
            event.target.value = '';
            // Don't reset fileName immediately, so user can see it
        }
    };
    reader.onerror = () => {
        setImportStatus({ loading: false, message: 'Gagal membaca file.', type: 'error' });
        setFileName('');
    };
    reader.readAsArrayBuffer(file);
};

  const handleFileRestoreSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus({ loading: true, message: 'Membaca file cadangan...', type: 'info' });

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result as string;
            const parsedData = JSON.parse(text);

            if (!Array.isArray(parsedData)) {
                throw new Error("Format file cadangan tidak valid. Seharusnya berupa array data wasit.");
            }
            
            setDataToRestore(parsedData);
            setRestoreModalOpen(true);
            setImportStatus({ loading: false, message: '', type: 'info' });
        } catch (error: any) {
            console.error(error);
            setImportStatus({ loading: false, message: `Gagal memproses file: ${error.message}`, type: 'error' });
        } finally {
            event.target.value = '';
        }
    };
    reader.onerror = () => {
        setImportStatus({ loading: false, message: 'Gagal membaca file.', type: 'error' });
    };
    reader.readAsText(file);
  };
  
  const handleConfirmRestore = () => {
    if (dataToRestore) {
        onRestoreData(dataToRestore);
        setImportStatus({ loading: false, message: 'Data berhasil dipulihkan dari cadangan.', type: 'success'});
    }
    setRestoreModalOpen(false);
    setDataToRestore(null);
  };


  const summaryData = useMemo(() => {
    const total = referees.length;
    const maleCount = referees.filter(r => r.gender === 'L').length;
    const femaleCount = referees.filter(r => r.gender === 'P').length;
    const byLicense = referees.reduce((acc, referee) => {
        acc[referee.highestLicense] = (acc[referee.highestLicense] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    return { total, maleCount, femaleCount, byLicense };
  }, [referees]);

  const sortedRefereesForPrint = useMemo(() => {
    return [...referees].sort((a, b) => {
        const indexA = LICENSE_LEVELS.indexOf(a.highestLicense);
        const indexB = LICENSE_LEVELS.indexOf(b.highestLicense);
        return indexA - indexB;
    });
  }, [referees]);

  const getStatusColor = () => {
    switch (importStatus.type) {
        case 'success': return 'text-green-700 bg-green-100';
        case 'error': return 'text-red-700 bg-red-100';
        default: return 'text-blue-700 bg-blue-100';
    }
  };

  if (refereeToPrint) {
    return <RefereePrintView referee={refereeToPrint} onBack={() => setRefereeToPrint(null)} logoUrl={logoUrl} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 no-print">
        <div>
            <h1 className="text-4xl font-bold text-slate-800">Dasbor Admin</h1>
            {adminEmail && (
                <p className="text-slate-500 mt-1">Selamat datang, <span className="font-semibold">{adminEmail}</span></p>
            )}
        </div>
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <DatabaseStatusIndicator status={dbStatus} />
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-gray-600 transition-colors"
            >
              <ArrowUturnLeftIcon className="w-5 h-5" />
              Kembali ke Halaman Utama
            </button>
        </div>
      </div>

      <div className="mb-6 border-b border-slate-200 no-print">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button onClick={() => setActiveTab('manage')} className={`${activeTab === 'manage' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
            Pengelolaan Data
          </button>
          <button onClick={() => setActiveTab('print')} className={`${activeTab === 'print' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
            Rekap & Cetak
          </button>
           <button onClick={() => setActiveTab('settings')} className={`${activeTab === 'settings' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
            Pengaturan
          </button>
        </nav>
      </div>

      {activeTab === 'manage' && (
        <div id="manage-section">
            <div className="flex justify-between items-center mb-4 no-print">
                <div className="flex items-center gap-1 bg-slate-200 rounded-lg p-1">
                     <button onClick={() => setManageMode('manual')} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${manageMode === 'manual' ? 'bg-white text-blue-700 shadow' : 'text-slate-600 hover:bg-slate-300'}`}>
                        Input Manual
                    </button>
                    <button onClick={() => setManageMode('bulk')} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${manageMode === 'bulk' ? 'bg-white text-blue-700 shadow' : 'text-slate-600 hover:bg-slate-300'}`}>
                        Input Massal (Excel)
                    </button>
                </div>
                {manageMode === 'manual' && (
                    <button
                    onClick={handleAddNew}
                    className="inline-flex items-center gap-2 bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-red-700 transition-colors"
                    >
                    <PlusIcon className="w-5 h-5" />
                    Tambah Wasit
                    </button>
                )}
          </div>

          {manageMode === 'manual' && (
              <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                  <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                      <th scope="col" className="px-6 py-3">Nama</th>
                      <th scope="col" className="px-6 py-3">Lisensi</th>
                      <th scope="col" className="px-6 py-3">Cabor</th>
                      <th scope="col" className="px-6 py-3">Alamat</th>
                      <th scope="col" className="px-6 py-3">Kontak</th>
                      <th scope="col" className="px-6 py-3 no-print">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referees.map((referee) => (
                      <tr key={referee.id} className="bg-white border-b hover:bg-slate-50">
                        <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{referee.name}</th>
                        <td className="px-6 py-4">{referee.highestLicense}</td>
                        <td className="px-6 py-4">{referee.sportBranch}</td>
                        <td className="px-6 py-4 truncate max-w-xs">{referee.address}</td>
                        <td className="px-6 py-4">{referee.phone}</td>
                        <td className="px-6 py-4 flex items-center gap-4 no-print">
                          <button onClick={() => handlePrintReferee(referee)} className="font-medium text-blue-600 hover:text-blue-800" title="Cetak Data Wasit">
                            <IdCardIcon className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleEdit(referee)} className="font-medium text-blue-600 hover:text-blue-800" title="Edit Data">
                            <PencilIcon/>
                          </button>
                          <button onClick={() => handleDelete(referee.id)} className="font-medium text-red-600 hover:text-red-800" title="Hapus Data">
                            <TrashIcon/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          )}

           {manageMode === 'bulk' && (
             <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Impor Data Massal dari Excel</h3>
                <p className="text-sm text-slate-600 mb-4">Unduh template, isi data, lalu unggah file `.xlsx` atau `.xls` untuk menambahkan beberapa wasit sekaligus.</p>
                
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                        <button
                            onClick={handleDownloadTemplate}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition-colors"
                        >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            Unduh Template
                        </button>
                        <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center gap-2 bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-red-700 transition-colors">
                            <ArrowUpTrayIcon className="w-5 h-5" />
                            Pilih File Untuk Diunggah
                        </label>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".xlsx, .xls" onChange={handleFileImport}/>
                    </div>
                    {fileName && <p className="mt-4 text-sm text-slate-500 text-center">File terpilih: {fileName}</p>}
                </div>

                {importStatus.message && (
                     <div className={`mt-4 p-3 rounded-lg text-sm ${getStatusColor()}`}>
                        {importStatus.loading && <span className="animate-spin inline-block mr-2 w-4 h-4 border-2 border-current border-t-transparent rounded-full" role="status" aria-label="loading"></span>}
                        {importStatus.message}
                    </div>
                )}
            </div>
           )}
        </div>
      )}
      
      {activeTab === 'print' && (
        <div id="print-section">
            <div className="flex justify-between items-center mb-4 no-print">
                <h2 className="text-xl font-semibold text-slate-800">Opsi Cetak & Rekapitulasi</h2>
                 <div className="flex items-center gap-4">
                    <button
                        onClick={onGoToBusinessCards}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition-colors"
                        >
                        <IdCardIcon className="w-5 h-5" />
                        Buat Kartu Nama
                    </button>
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-red-700 transition-colors"
                        >
                        <PrintIcon className="w-5 h-5" />
                        Cetak Rekap
                    </button>
                </div>
            </div>
            <div className="bg-white p-8 shadow-lg rounded-lg">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-800">Rekapitulasi Data Wasit Akuatik</h2>
                    <p className="text-slate-600">Provinsi Sulawesi Selatan - {new Date().getFullYear()}</p>
                </div>
                
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Ringkasan</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-100 p-4 rounded-lg">
                            <p className="text-sm font-medium text-slate-500">Total Wasit</p>
                            <p className="text-2xl font-bold text-slate-800">{summaryData.total}</p>
                        </div>
                         <div className="bg-slate-100 p-4 rounded-lg">
                            <p className="text-sm font-medium text-slate-500">Wasit Pria</p>
                            <p className="text-2xl font-bold text-slate-800">{summaryData.maleCount}</p>
                        </div>
                        <div className="bg-slate-100 p-4 rounded-lg">
                            <p className="text-sm font-medium text-slate-500">Wasit Wanita</p>
                            <p className="text-2xl font-bold text-slate-800">{summaryData.femaleCount}</p>
                        </div>
                    </div>
                     <div className="mt-4">
                        <h4 className="text-md font-semibold text-slate-600 mb-2">Berdasarkan Lisensi</h4>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(summaryData.byLicense).map(([level, count]) => (
                                 <div key={level} className="bg-slate-50 p-3 rounded-lg">
                                    <p className="text-sm font-medium text-slate-500 truncate">{level}</p>
                                    <p className="text-xl font-bold text-slate-700">{count as number}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Detail Data Wasit</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500">
                             <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">#</th>
                                    <th scope="col" className="px-6 py-3">Nama</th>
                                    <th scope="col" className="px-6 py-3">TTL</th>
                                    <th scope="col" className="px-6 py-3">Lisensi</th>
                                    <th scope="col" className="px-6 py-3">Cabor</th>
                                    <th scope="col" className="px-6 py-3">Kontak</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedRefereesForPrint.map((referee, index) => (
                                    <tr key={referee.id} className="bg-white border-b">
                                        <td className="px-4 py-3">{index + 1}</td>
                                        <th scope="row" className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{referee.name}</th>
                                        <td className="px-4 py-3">{`${referee.placeOfBirth}, ${referee.dateOfBirth}`}</td>
                                        <td className="px-4 py-3">{referee.highestLicense}</td>
                                        <td className="px-4 py-3">{referee.sportBranch}</td>
                                        <td className="px-4 py-3">{referee.phone}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                 <div className="mt-12 text-right text-sm text-slate-500">
                    <p>Dicetak pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div id="settings-section" className="space-y-8">
            <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Pengaturan Logo Aplikasi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                        <p className="text-sm text-slate-600 mb-2">Pratinjau Logo Saat Ini:</p>
                        <div className="w-full h-32 flex items-center justify-center bg-slate-100 rounded-lg border border-slate-200">
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo saat ini" className="max-h-28 w-auto" />
                            ) : (
                                <div className="text-slate-400 text-center">
                                    <PhotoIcon className="w-12 h-12 mx-auto" />
                                    <p>Tidak ada logo</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                             <label htmlFor="logo-upload" className="cursor-pointer w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition-colors">
                                <ArrowUpTrayIcon className="w-5 h-5" />
                                Unggah Logo Baru
                            </label>
                            <input id="logo-upload" name="logo-upload" type="file" className="sr-only" accept="image/*" onChange={handleLogoUpload}/>
                            <p className="text-xs text-slate-500 mt-2">Gunakan format PNG, JPG, atau SVG untuk hasil terbaik.</p>
                        </div>
                        {logoUrl && (
                             <button
                                onClick={() => onLogoChange(null)}
                                className="w-full inline-flex items-center justify-center gap-2 bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-red-700 transition-colors"
                            >
                                <TrashIcon className="w-5 h-5" />
                                Hapus Logo
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Manajemen Data</h3>
                <p className="text-sm text-slate-600 mb-4">Simpan cadangan, pulihkan dari cadangan, atau ekspor data ke format lain.</p>
                 <div className="space-y-6">
                    <div>
                      <h4 className="text-md font-medium text-slate-700 mb-2">Backup & Ekspor</h4>
                      <div className="flex flex-col sm:flex-row gap-4">
                          <button
                              onClick={handleBackupData}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition-colors"
                          >
                              <ArrowDownTrayIcon className="w-5 h-5" />
                              Backup ke JSON
                          </button>
                          <button
                              onClick={handleBackupDataExcel}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-blue-800 transition-colors"
                          >
                              <ArrowDownTrayIcon className="w-5 h-5" />
                              Backup ke Excel
                          </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Gunakan JSON untuk memulihkan data ke aplikasi, atau Excel untuk pelaporan.</p>
                    </div>

                    <div className="border-t pt-6">
                      <h4 className="text-md font-medium text-slate-700 mb-2">Pulihkan dari Cadangan</h4>
                      <p className="text-sm text-slate-600 mb-3">Pilih file cadangan JSON (.json) untuk menimpa semua data saat ini. Tindakan ini akan menghapus semua data yang ada.</p>
                      <div>
                        <label htmlFor="restore-upload" className="cursor-pointer inline-flex items-center gap-2 bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-yellow-600 transition-colors">
                            <ArrowUpTrayIcon className="w-5 h-5" />
                            Pilih File Cadangan (.json)
                        </label>
                        <input id="restore-upload" name="restore-upload" type="file" className="sr-only" accept=".json" onChange={handleFileRestoreSelect}/>
                      </div>
                    </div>
                </div>
                 {importStatus.message && (
                     <div className={`mt-4 p-3 rounded-lg text-sm ${getStatusColor()}`}>
                        {importStatus.loading && <span className="animate-spin inline-block mr-2 w-4 h-4 border-2 border-current border-t-transparent rounded-full" role="status" aria-label="loading"></span>}
                        {importStatus.message}
                    </div>
                )}
            </div>

            <div className="bg-white shadow-md rounded-lg p-6 border-2 border-red-500/50">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Zona Berbahaya</h3>
                <p className="text-sm text-slate-600 mb-4">Tindakan di bawah ini bersifat permanen dan tidak dapat dibatalkan. Lakukan dengan hati-hati.</p>
                 <button
                    onClick={() => setDeleteAllModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-red-700 transition-colors"
                >
                    <TrashIcon className="w-5 h-5" />
                    Hapus Semua Data Wasit
                </button>
            </div>
        </div>
      )}

      <RefereeFormModal
        isOpen={isFormModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        refereeToEdit={refereeToEdit}
      />

      <ConfirmationModal
        isOpen={isConfirmDeleteModalOpen}
        onClose={() => setConfirmDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Konfirmasi Penghapusan"
        message={`Apakah Anda yakin ingin menghapus data wasit ini? Tindakan ini tidak dapat dibatalkan.`}
      />

      <DeleteAllConfirmationModal
        isOpen={isDeleteAllModalOpen}
        onClose={() => setDeleteAllModalOpen(false)}
        onConfirm={confirmDeleteAll}
      />

      <RestoreBackupModal
        isOpen={isRestoreModalOpen}
        onClose={() => setRestoreModalOpen(false)}
        onConfirm={handleConfirmRestore}
      />
    </div>
  );
};

export default AdminPage;
