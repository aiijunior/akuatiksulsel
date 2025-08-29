import React, { useState, useEffect } from 'react';
import { Referee } from '../types';
import { LICENSE_LEVELS, SPORT_BRANCHES, ADMIN_CREDENTIALS } from '../config';
import { XMarkIcon } from './icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  logoUrl?: string | null;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, logoUrl }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 no-print" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b">
           {logoUrl && (
            <div className="flex justify-center mb-4">
              <img src={logoUrl} alt="Logo Aplikasi" className="h-16 w-auto" />
            </div>
           )}
          <h3 className="text-xl font-semibold text-slate-800 text-center">{title}</h3>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (username: string) => void;
    logoUrl?: string | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, logoUrl }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const isValid = ADMIN_CREDENTIALS.some(
            cred => cred.username === username && cred.password === password
        );

        if (isValid) {
            setError('');
            onLogin(username);
        } else {
            setError('Username atau password salah.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Login Admin" logoUrl={logoUrl}>
            <form onSubmit={handleLogin}>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <div className="mb-4">
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="username">
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="password">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="flex items-center justify-end">
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
                    >
                        Login
                    </button>
                </div>
            </form>
        </Modal>
    );
};


interface RefereeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (referee: Omit<Referee, 'id'> | Referee) => void;
    refereeToEdit: Referee | null;
}

export const RefereeFormModal: React.FC<RefereeFormModalProps> = ({ isOpen, onClose, onSubmit, refereeToEdit }) => {
    const getInitialFormData = (): Omit<Referee, 'id'> => ({
        name: '',
        gender: 'L',
        placeOfBirth: '',
        dateOfBirth: '',
        address: '',
        phone: '',
        email: '',
        licenseNumber: '',
        highestLicense: LICENSE_LEVELS[0],
        sportBranch: SPORT_BRANCHES[0],
        experience: Array(5).fill(''),
        photoUrl: '',
    });

    const [formData, setFormData] = useState<Omit<Referee, 'id'>>(getInitialFormData());

    useEffect(() => {
        if (isOpen) {
            if (refereeToEdit) {
                 // Ensure experience array has 5 elements
                const experiences = refereeToEdit.experience || [];
                const fullExperience = [...experiences, ...Array(5 - experiences.length).fill('')].slice(0, 5);
                setFormData({...refereeToEdit, experience: fullExperience});
            } else {
                setFormData({
                    ...getInitialFormData(),
                    photoUrl: `https://picsum.photos/seed/${Math.random()}/400`
                });
            }
        }
    }, [refereeToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleExperienceChange = (index: number, value: string) => {
        const newExperience = [...formData.experience];
        newExperience[index] = value;
        setFormData(prev => ({ ...prev, experience: newExperience }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalData = {
            ...formData,
            experience: formData.experience.filter(exp => exp.trim() !== ''),
        };
        onSubmit(refereeToEdit ? { ...finalData, id: refereeToEdit.id } : finalData);
        onClose();
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={refereeToEdit ? 'Edit Data Wasit' : 'Tambah Wasit Baru'}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-semibold text-slate-800">{refereeToEdit ? 'Edit Data Wasit' : 'Tambah Wasit Baru'}</h3>
              <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nama Lengkap</label>
                          <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700">Jenis Kelamin</label>
                          <div className="mt-2 flex gap-4 pt-1">
                              <label className="inline-flex items-center">
                                  <input type="radio" className="form-radio text-blue-600" name="gender" value="L" checked={formData.gender === 'L'} onChange={handleChange} />
                                  <span className="ml-2 text-slate-700">Laki-laki</span>
                              </label>
                              <label className="inline-flex items-center">
                                  <input type="radio" className="form-radio text-pink-600" name="gender" value="P" checked={formData.gender === 'P'} onChange={handleChange} />
                                  <span className="ml-2 text-slate-700">Perempuan</span>
                              </label>
                          </div>
                      </div>
                      <div>
                          <label htmlFor="placeOfBirth" className="block text-sm font-medium text-slate-700">Tempat Lahir</label>
                          <input type="text" name="placeOfBirth" id="placeOfBirth" value={formData.placeOfBirth} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                       <div>
                          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-slate-700">Tanggal Lahir</label>
                          <input type="date" name="dateOfBirth" id="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                  </div>
                   <div>
                      <label htmlFor="address" className="block text-sm font-medium text-slate-700">Alamat Lengkap</label>
                      <textarea name="address" id="address" value={formData.address} onChange={handleChange} required rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
                  </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Nomor Telepon</label>
                          <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                          <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
                          <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                       <div>
                          <label htmlFor="licenseNumber" className="block text-sm font-medium text-slate-700">Nomor Lisensi</label>
                          <input type="text" name="licenseNumber" id="licenseNumber" value={formData.licenseNumber} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                       <div>
                          <label htmlFor="photoUrl" className="block text-sm font-medium text-slate-700">URL Foto</label>
                          <input type="url" name="photoUrl" id="photoUrl" value={formData.photoUrl} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                       <div>
                          <label htmlFor="highestLicense" className="block text-sm font-medium text-slate-700">Lisensi Tertinggi</label>
                          <select name="highestLicense" id="highestLicense" value={formData.highestLicense} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                              {LICENSE_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
                          </select>
                      </div>
                       <div>
                          <label htmlFor="sportBranch" className="block text-sm font-medium text-slate-700">Cabang Olahraga</label>
                          <select name="sportBranch" id="sportBranch" value={formData.sportBranch} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                              {SPORT_BRANCHES.map(branch => <option key={branch} value={branch}>{branch}</option>)}
                          </select>
                      </div>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700">5 Pengalaman Bertugas Terakhir</label>
                      <div className="space-y-2 mt-1">
                          {formData.experience.map((exp, index) => (
                               <input 
                                  key={index}
                                  type="text" 
                                  placeholder={`Pengalaman ${index + 1}`}
                                  value={exp} 
                                  onChange={(e) => handleExperienceChange(index, e.target.value)}
                                  className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                               />
                          ))}
                      </div>
                  </div>
                   <div className="flex justify-end pt-4 space-x-2">
                      <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 transition-colors">Batal</button>
                      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">{refereeToEdit ? 'Simpan Perubahan' : 'Tambah Wasit'}</button>
                  </div>
              </form>
            </div>
          </div>
        </Modal>
    );
};

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <p className="text-slate-600 mb-6">{message}</p>
            <div className="flex justify-end space-x-2">
                <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 transition-colors">Batal</button>
                <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">Konfirmasi</button>
            </div>
        </Modal>
    );
};

export const DeleteAllConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}> = ({ isOpen, onClose, onConfirm }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleConfirm = (e: React.FormEvent) => {
        e.preventDefault();
        const isValid = ADMIN_CREDENTIALS.some(
            cred => cred.username === username && cred.password === password
        );
        if (isValid) {
            setError('');
            onConfirm();
        } else {
            setError('Username atau password admin tidak valid.');
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setUsername('');
            setPassword('');
            setError('');
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Konfirmasi Hapus Semua Data">
            <form onSubmit={handleConfirm}>
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                    <p className="font-bold">Tindakan Berbahaya</p>
                    <p>Anda akan menghapus SEMUA data wasit. Tindakan ini tidak dapat dibatalkan. Untuk melanjutkan, masukkan kredensial admin.</p>
                </div>

                {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

                <div className="mb-4">
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="admin-username-delete">
                        Username Admin
                    </label>
                    <input
                        id="admin-username-delete"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="admin-password-delete">
                        Password Admin
                    </label>
                    <input
                        id="admin-password-delete"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div className="flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 transition-colors">Batal</button>
                    <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">Konfirmasi & Hapus Semua</button>
                </div>
            </form>
        </Modal>
    );
};

export const RestoreBackupModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}> = ({ isOpen, onClose, onConfirm }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleConfirm = (e: React.FormEvent) => {
        e.preventDefault();
        const isValid = ADMIN_CREDENTIALS.some(
            cred => cred.username === username && cred.password === password
        );

        if (isValid) {
            setError('');
            onConfirm();
        } else {
            setError('Username atau password admin tidak valid.');
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setUsername('');
            setPassword('');
            setError('');
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Konfirmasi Pemulihan Data">
            <form onSubmit={handleConfirm}>
                <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 p-4" role="alert">
                    <p className="font-bold">Peringatan</p>
                    <p>Anda akan menimpa SEMUA data wasit yang ada saat ini dengan data dari file cadangan. Tindakan ini tidak dapat dibatalkan. Untuk melanjutkan, masukkan kredensial admin.</p>
                </div>

                {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

                <div className="mb-4">
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="admin-username-restore">
                        Username Admin
                    </label>
                    <input
                        id="admin-username-restore"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="admin-password-restore">
                        Password Admin
                    </label>
                    <input
                        id="admin-password-restore"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div className="flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 transition-colors">Batal</button>
                    <button type="submit" className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors">Konfirmasi & Pulihkan</button>
                </div>
            </form>
        </Modal>
    );
};

export const RefereeDetailModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    referee: Referee | null;
    logoUrl: string | null;
}> = ({ isOpen, onClose, referee, logoUrl }) => {
    if (!referee) return null;

    const DetailItem: React.FC<{ label: string; value: string | undefined | null }> = ({ label, value }) => (
        <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
            <p className="text-md text-slate-800">{value || '-'}</p>
        </div>
    );

    const formattedDate = referee.dateOfBirth 
        ? new Date(referee.dateOfBirth).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }) 
        : null;
    const ttlValue = [referee.placeOfBirth, formattedDate].filter(Boolean).join(', ');
    
    const validExperiences = referee.experience?.filter(exp => exp && exp.trim() !== '');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Detail Data Wasit" logoUrl={logoUrl}>
            <div className="relative">
                {logoUrl && (
                    <div className="watermark">
                        <img src={logoUrl} alt="Watermark Logo" />
                    </div>
                )}
                <div className="relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-4">
                            <img src={referee.photoUrl} alt={`Foto ${referee.name}`} className="w-full h-auto object-cover rounded-lg shadow-lg border-2 border-slate-100" />
                        </div>
                        <div className="md:col-span-8">
                            <h2 className="text-3xl font-bold text-blue-800">{referee.name}</h2>
                            <p className="text-md font-medium text-slate-500 mb-4">No. Lisensi: {referee.licenseNumber || '-'}</p>

                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                <DetailItem label="Jenis Kelamin" value={referee.gender === 'L' ? 'Laki-laki' : 'Perempuan'} />
                                <DetailItem label="Tempat, Tgl Lahir" value={ttlValue} />
                                <DetailItem label="Nomor Telepon" value={referee.phone} />
                                <DetailItem label="Email" value={referee.email} />
                                <div className="col-span-2">
                                    <DetailItem label="Alamat" value={referee.address} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-200">
                        <h3 className="text-xl font-bold text-slate-700 mb-4">Informasi Lisensi Wasit</h3>
                        <div className="grid grid-cols-2 gap-6 bg-slate-50/70 p-4 rounded-lg">
                            <DetailItem label="Lisensi Tertinggi" value={referee.highestLicense} />
                            <DetailItem label="Cabang Olahraga" value={referee.sportBranch} />
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-xl font-bold text-slate-700 mb-4">Pengalaman Bertugas</h3>
                        {validExperiences && validExperiences.length > 0 ? (
                            <ul className="list-disc list-inside space-y-2 text-slate-700">
                                {validExperiences.map((exp, index) => (
                                    <li key={index}>{exp}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-slate-500">Belum ada data pengalaman yang dicatat.</p>
                        )}
                    </div>
                     <div className="flex justify-end pt-4 mt-6 border-t border-slate-200">
                        <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 transition-colors">Tutup</button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
