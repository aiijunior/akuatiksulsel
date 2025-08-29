import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Referee } from './types';
import { APP_TITLE } from './config';
import { UserCircleIcon, ArrowLeftOnRectangleIcon } from './components/icons';
import { LoginModal } from './components/modals';
import HomePage from './components/HomePage';
import AdminPage from './components/AdminPage';
import { BusinessCardPage } from './components/BusinessCardPage';
import { supabase } from './lib/supabaseClient';


// Helper function to map database snake_case to application camelCase
const mapToCamelCase = (dbReferee: any): Referee => ({
  id: dbReferee.id,
  name: dbReferee.name || '',
  gender: dbReferee.gender || 'L',
  placeOfBirth: dbReferee.place_of_birth || '',
  dateOfBirth: dbReferee.date_of_birth || '',
  address: dbReferee.address || '',
  phone: dbReferee.phone || '',
  email: dbReferee.email || '',
  licenseNumber: dbReferee.license_number || '',
  highestLicense: dbReferee.highest_license || '',
  sportBranch: dbReferee.sport_branch || '',
  experience: dbReferee.experience || [],
  photoUrl: dbReferee.photo_url || '',
});

// Helper function to map application camelCase to database snake_case
const mapToSnakeCase = (appReferee: Partial<Omit<Referee, 'id'>>): any => {
    const dbObject: { [key: string]: any } = {};
    if (appReferee.name !== undefined) dbObject.name = appReferee.name;
    if (appReferee.gender !== undefined) dbObject.gender = appReferee.gender;
    if (appReferee.placeOfBirth !== undefined) dbObject.place_of_birth = appReferee.placeOfBirth;
    if (appReferee.dateOfBirth !== undefined) dbObject.date_of_birth = appReferee.dateOfBirth;
    if (appReferee.address !== undefined) dbObject.address = appReferee.address;
    if (appReferee.phone !== undefined) dbObject.phone = appReferee.phone;
    if (appReferee.email !== undefined) dbObject.email = appReferee.email;
    if (appReferee.licenseNumber !== undefined) dbObject.license_number = appReferee.licenseNumber;
    if (appReferee.highestLicense !== undefined) dbObject.highest_license = appReferee.highestLicense;
    if (appReferee.sportBranch !== undefined) dbObject.sport_branch = appReferee.sportBranch;
    if (appReferee.experience !== undefined) dbObject.experience = appReferee.experience;
    if (appReferee.photoUrl !== undefined) dbObject.photo_url = appReferee.photoUrl;
    return dbObject;
};


const Header: React.FC<{
    isLoggedIn: boolean;
    onLoginClick: () => void;
    onLogout: () => void;
    onHomeClick: () => void;
    logoUrl: string | null;
    adminEmail: string | null;
}> = ({ isLoggedIn, onLoginClick, onLogout, onHomeClick, logoUrl, adminEmail }) => (
    <header className="bg-blue-900 shadow-md text-white no-print">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div onClick={onHomeClick} className="flex items-center gap-3 cursor-pointer">
              {logoUrl && <img src={logoUrl} alt="App Logo" className="h-10 w-auto" />}
              <h1 className="text-xl md:text-2xl font-bold hover:text-blue-200 transition-colors">{APP_TITLE}</h1>
            </div>
            <nav>
                {isLoggedIn ? (
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-right hidden sm:block">
                            <p className="font-medium truncate max-w-[200px]">{adminEmail}</p>
                            <p className="text-xs text-blue-200">Admin</p>
                        </div>
                        <button onClick={onLogout} className="flex items-center gap-2 px-3 py-2 bg-red-600 rounded-md hover:bg-red-700 transition-colors" title="Logout">
                            <ArrowLeftOnRectangleIcon className="w-5 h-5"/>
                            <span className="hidden md:inline">Logout</span>
                        </button>
                    </div>
                ) : (
                    <button onClick={onLoginClick} className="p-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors" title="Admin Login" aria-label="Admin Login">
                        <UserCircleIcon className="w-6 h-6" />
                    </button>
                )}
            </nav>
        </div>
    </header>
);

const Footer: React.FC = () => (
    <footer className="bg-blue-900 text-slate-300 text-center p-4 mt-auto no-print">
        <p>&copy; {new Date().getFullYear()} {APP_TITLE}. All rights reserved.</p>
    </footer>
);


function App() {
  const [referees, setReferees] = useState<Referee[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInAdminEmail, setLoggedInAdminEmail] = useState<string | null>(null);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'admin' | 'businessCard'>('home');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');


  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        setDbStatus('connecting');
        try {
            // Fetch referees
            const { data: refereesData, error: refereesError } = await supabase
                .from('referees')
                .select('*')
                .order('name', { ascending: true });

            if (refereesError) throw new Error(`Error fetching referees: ${refereesError.message}`);
            if (refereesData) {
              setReferees(refereesData.map(mapToCamelCase));
            }

            // Fetch logo
            const { data: settingsData, error: settingsError } = await supabase
                .from('app_settings')
                .select('value')
                .eq('key', 'logo_url')
                .single();
            
            if (settingsError && settingsError.code !== 'PGRST116') { // Ignore 'single row not found' error
                throw new Error(`Error fetching settings: ${settingsError.message}`);
            }

            if (settingsData) {
                setLogoUrl(settingsData.value);
            }
            setDbStatus('connected');
        } catch (err: any) {
            console.error("Error fetching data:", err);
            setError(`Gagal memuat data dari database. Pastikan koneksi dan konfigurasi Supabase sudah benar, dan RLS (Row Level Security) telah diatur untuk memperbolehkan akses baca (SELECT).`);
            setDbStatus('error');
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
  }, []);

  const handleLogoChange = async (newLogoUrl: string | null) => {
    setLogoUrl(newLogoUrl); // Optimistic UI update
    const { error } = await supabase
        .from('app_settings')
        .upsert({ key: 'logo_url', value: newLogoUrl }, { onConflict: 'key' });

    if (error) {
        console.error("Error saving logo:", error);
        setError("Gagal menyimpan logo. Data di database mungkin tidak sinkron.");
    }
  };

  const handleLogin = (username: string) => {
    setIsLoggedIn(true);
    setLoggedInAdminEmail(username);
    setLoginModalOpen(false);
    setCurrentPage('admin');
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInAdminEmail(null);
    setCurrentPage('home');
  };

  const handleHomeClick = () => {
    setCurrentPage('home');
  };

  const handleGoToBusinessCards = () => {
    setCurrentPage('businessCard');
  };

  const handleBackToAdmin = () => {
      setCurrentPage('admin');
  };

  const addReferee = async (referee: Omit<Referee, 'id'>) => {
    const snakeCaseReferee = mapToSnakeCase(referee);
    const { data, error } = await supabase
        .from('referees')
        .insert(snakeCaseReferee)
        .select()
        .single();
    
    if (error) {
        console.error("Error adding referee:", error);
        setError("Gagal menambah wasit.");
        return;
    }
    if (data) {
        setReferees(prev => [...prev, mapToCamelCase(data)]);
    }
  };

  const addMultipleReferees = async (newReferees: Omit<Referee, 'id'>[]) => {
      const refereesToInsert = newReferees.map(r => mapToSnakeCase(r));
      const { data, error } = await supabase.from('referees').insert(refereesToInsert).select();
      
      if (error) {
        console.error("Error adding multiple referees:", error);
        // Re-throw the error so the calling component can catch it and show a detailed message
        throw error;
      }
      if (data) {
        setReferees(prev => [...prev, ...data.map(mapToCamelCase)]);
      }
  };
  
  const updateReferee = async (updatedReferee: Referee) => {
    const snakeCaseReferee = mapToSnakeCase(updatedReferee);
    const { data, error } = await supabase
        .from('referees')
        .update(snakeCaseReferee)
        .eq('id', updatedReferee.id)
        .select()
        .single();
    
    if (error) {
        console.error("Error updating referee:", error);
        setError("Gagal memperbarui data wasit.");
        return;
    }
    if (data) {
        setReferees(prev => prev.map(r => r.id === updatedReferee.id ? mapToCamelCase(data) : r));
    }
  };
  
  const deleteReferee = async (id: string) => {
    const { error } = await supabase
        .from('referees')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting referee:", error);
        setError("Gagal menghapus wasit.");
        return;
    }
    setReferees(prev => prev.filter(r => r.id !== id));
  };

  const handleDeleteAllReferees = async () => {
    const idsToDelete = referees.map(r => r.id);
    if (idsToDelete.length === 0) return;

    const { error } = await supabase
        .from('referees')
        .delete()
        .in('id', idsToDelete);

    if (error) {
        console.error("Error deleting all referees:", error);
        setError("Gagal menghapus semua wasit.");
        return;
    }
    setReferees([]);
  };

  const handleRestoreData = async (restoredReferees: Referee[]) => {
    setIsLoading(true);
    // 1. Delete all existing referees
    const existingIds = referees.map(r => r.id);
    if (existingIds.length > 0) {
        const { error: deleteError } = await supabase.from('referees').delete().in('id', existingIds);
        if (deleteError) {
            console.error("Error clearing table for restore:", deleteError);
            setError("Gagal membersihkan data lama untuk pemulihan.");
            setIsLoading(false);
            return;
        }
    }

    // 2. Insert new referees, ensuring they have IDs
    const refereesToInsert = restoredReferees.map(r => ({ ...mapToSnakeCase(r), id: r.id || uuidv4() }));
    const { data: insertedData, error: insertError } = await supabase.from('referees').insert(refereesToInsert).select();

    if (insertError) {
        console.error("Error inserting restored data:", insertError);
        setError("Gagal memulihkan data. Database mungkin dalam keadaan kosong.");
        setReferees([]); // Clear state as it's inconsistent
        setIsLoading(false);
        return;
    }
    
    // 3. Set state with newly inserted data to ensure consistency
    setReferees(insertedData ? insertedData.map(mapToCamelCase) : []);
    setIsLoading(false);
  };

  const renderPage = () => {
    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-80">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-4 text-slate-600 text-xl">Memuat data dari database...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-4 md:p-8">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md" role="alert">
                    <p className="font-bold text-lg">Terjadi Kesalahan</p>
                    <p className="mt-2">{error}</p>
                </div>
            </div>
        );
    }
    
    switch (currentPage) {
        case 'home':
            return <HomePage referees={referees} logoUrl={logoUrl} />;
        case 'admin':
            if (isLoggedIn) {
                return <AdminPage 
                    referees={referees} 
                    onAddReferee={addReferee} 
                    onUpdateReferee={updateReferee}
                    onDeleteReferee={deleteReferee}
                    onDeleteAllReferees={handleDeleteAllReferees}
                    onAddMultipleReferees={addMultipleReferees}
                    onRestoreData={handleRestoreData}
                    onBackToHome={handleHomeClick}
                    logoUrl={logoUrl}
                    onLogoChange={handleLogoChange}
                    onGoToBusinessCards={handleGoToBusinessCards}
                    dbStatus={dbStatus}
                    adminEmail={loggedInAdminEmail}
                />;
            }
            return <HomePage referees={referees} logoUrl={logoUrl} />; // Fallback to home if not logged in
        case 'businessCard':
             if (isLoggedIn) {
                return <BusinessCardPage
                    referees={referees}
                    logoUrl={logoUrl}
                    onBackToAdmin={handleBackToAdmin}
                />;
             }
             return <HomePage referees={referees} logoUrl={logoUrl} />; // Fallback
        default:
            return <HomePage referees={referees} logoUrl={logoUrl} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        isLoggedIn={isLoggedIn} 
        onLoginClick={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
        onHomeClick={handleHomeClick}
        logoUrl={logoUrl}
        adminEmail={loggedInAdminEmail}
      />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <Footer />
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
        onLogin={handleLogin}
        logoUrl={logoUrl}
      />
    </div>
  );
}

export default App;
