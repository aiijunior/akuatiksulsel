import React, { useMemo, useState } from 'react';
import { Referee } from '../types';
import { LICENSE_LEVELS, SPORT_BRANCHES } from '../config';
import { MaleIcon, FemaleIcon, XMarkIcon, ShieldCheckIcon, AcademicCapIcon, TrophyIcon, GlobeAltIcon } from './icons';
import { RefereeDetailModal } from './modals';

interface SummaryCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    color: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, color }) => (
    <div className={`p-4 rounded-lg shadow-lg text-white ${color}`}>
        <div className="flex items-center gap-4">
            {icon}
            <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-3xl font-bold mt-1">{value}</p>
            </div>
        </div>
    </div>
);

interface DonutChartProps {
    male: number;
    female: number;
    total: number;
}
const DonutChart: React.FC<DonutChartProps> = ({ male, female, total }) => {
    const size = 160;
    const strokeWidth = 20;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const malePercentage = total > 0 ? (male / total) : 0;
    const maleDashoffset = circumference * (1 - malePercentage);

    return (
        <div className="relative flex justify-center items-center bg-slate-50 p-6 rounded-lg shadow-lg">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={"#ef4444"} // Female color (red-500)
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={"#3b82f6"} // Male color (blue-500)
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={maleDashoffset}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-slate-800">{total}</span>
                <span className="text-sm font-medium text-slate-500">Total Wasit</span>
            </div>
        </div>
    );
};


interface RefereeCardProps {
    referee: Referee;
    onCardClick: (referee: Referee) => void;
}

const RefereeCard: React.FC<RefereeCardProps> = ({ referee, onCardClick }) => (
    <div 
        className="group relative rounded-md shadow-md overflow-hidden transform hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        onClick={() => onCardClick(referee)}
    >
        {/* Referee photo */}
        <div className="aspect-square bg-slate-200">
            <img 
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105" 
                src={referee.photoUrl} 
                alt={referee.name}
                loading="lazy"
            />
        </div>

        {/* Gradient and text overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 p-2 w-full">
            <h4 className="text-sm font-bold text-white truncate">{referee.name}</h4>
            <p className="text-[11px] text-blue-200">{referee.sportBranch}</p>
        </div>
    </div>
);

interface HomePageProps {
    referees: Referee[];
    logoUrl: string | null;
}

const HomePage: React.FC<HomePageProps> = ({ referees, logoUrl }) => {
    const [selectedReferee, setSelectedReferee] = useState<Referee | null>(null);
    const [selectedLicense, setSelectedLicense] = useState<string | null>(null);

    const handleViewDetails = (referee: Referee) => {
        setSelectedReferee(referee);
    };

    const handleCloseDetails = () => {
        setSelectedReferee(null);
    };
    
    const handleLicenseClick = (level: string) => {
        setSelectedLicense(prevLevel => (prevLevel === level ? null : level));
    };

    const summaryData = useMemo(() => {
        const total = referees.length;
        const maleCount = referees.filter(r => r.gender === 'L').length;
        const femaleCount = referees.filter(r => r.gender === 'P').length;
        const byLicense = LICENSE_LEVELS.map(level => ({
            level,
            count: referees.filter(r => r.highestLicense === level).length
        }));
        const bySportBranch = SPORT_BRANCHES.map(branch => ({
            branch,
            count: referees.filter(r => r.sportBranch === branch).length
        }));
        return { total, maleCount, femaleCount, byLicense, bySportBranch };
    }, [referees]);

    const filteredReferees = useMemo(() => {
        if (!selectedLicense) return referees;
        return referees.filter(r => r.highestLicense === selectedLicense);
    }, [referees, selectedLicense]);
    
    const getLicenseVisuals = (level: string): { Icon: React.FC<{ className?: string }>, color: string, letter: string } => {
        if (level.includes("Lisensi A")) {
            return { Icon: GlobeAltIcon, color: "bg-red-700", letter: 'A' };
        }
        if (level.includes("Lisensi B")) {
            return { Icon: TrophyIcon, color: "bg-red-500", letter: 'B' };
        }
        if (level.includes("Lisensi C")) {
            return { Icon: AcademicCapIcon, color: "bg-blue-700", letter: 'C' };
        }
        if (level.includes("Lisensi D")) {
            return { Icon: ShieldCheckIcon, color: "bg-blue-500", letter: 'D' };
        }
        // Fallback
        const letter = level.match(/Lisensi (\w)/)?.[1] || '?';
        return { Icon: ShieldCheckIcon, color: "bg-slate-500", letter };
    };


    return (
        <div className="container mx-auto px-4 py-8">
            <section id="rekap" className="mb-12">
                <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">Rekapitulasi Wasit</h2>
                
                {/* Gender and Total Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-center">
                    <DonutChart male={summaryData.maleCount} female={summaryData.femaleCount} total={summaryData.total} />
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <SummaryCard title="Wasit Pria" value={summaryData.maleCount} icon={<MaleIcon className="w-10 h-10 text-white/80"/>} color="bg-blue-600" />
                        <SummaryCard title="Wasit Wanita" value={summaryData.femaleCount} icon={<FemaleIcon className="w-10 h-10 text-white/80"/>} color="bg-red-500" />
                    </div>
                </div>

                {/* Combined License and Sport Branch Summaries */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    {/* License Summary Section */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold text-slate-700 mb-4">Rekapitulasi Lisensi</h3>
                        <ul className="space-y-3">
                          {summaryData.byLicense.slice().reverse().map(({ level, count }) => {
                              const { Icon, color, letter } = getLicenseVisuals(level);
                              const parts = level.match(/Lisensi \w \((.+)\)/);
                              if (!parts) return null;
                              const description = parts[1];
                              return (
                                  <li 
                                    key={level}
                                    onClick={() => handleLicenseClick(level)}
                                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleLicenseClick(level)}
                                    tabIndex={0}
                                    role="button"
                                    aria-pressed={selectedLicense === level}
                                    className={`flex items-center justify-between gap-4 p-3 rounded-lg transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                        selectedLicense === level
                                        ? 'bg-blue-100 ring-2 ring-blue-500 shadow-md'
                                        : 'bg-slate-50 hover:bg-slate-100 hover:shadow-sm'
                                    }`}
                                  >
                                      <div className="flex items-center gap-4">
                                          <span className={`flex-shrink-0 text-white ${color} w-11 h-11 rounded-lg flex items-center justify-center shadow`}>
                                              <Icon className="w-6 h-6" />
                                          </span>
                                          <div>
                                              <span className="font-semibold text-slate-800">{`Lisensi ${letter}`}</span>
                                              <span className="text-slate-600"> &mdash; {description}</span>
                                          </div>
                                      </div>
                                      <div className="flex items-baseline gap-2">
                                          <span className="text-3xl font-bold text-blue-800">{count}</span>
                                          <span className="text-sm font-medium text-slate-500">Wasit</span>
                                      </div>
                                  </li>
                              );
                          })}
                        </ul>
                    </div>

                    {/* Sport Branch Summary Section */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold text-slate-700 mb-4">Rekapitulasi Cabang Olahraga</h3>
                        <ul className="space-y-3">
                          {summaryData.bySportBranch.map(({ branch, count }) => {
                              return (
                                  <li key={branch} className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                      <div>
                                          <span className="font-semibold text-slate-800">{branch}</span>
                                      </div>
                                      <div className="flex items-baseline gap-2">
                                          <span className="text-3xl font-bold text-blue-600">{count}</span>
                                          <span className="text-sm font-medium text-slate-500">Wasit</span>
                                      </div>
                                  </li>
                              );
                          })}
                        </ul>
                    </div>
                </div>
            </section>

            <section id="data-wasit" className="relative mt-12">
                <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mb-6 text-center">
                    <h2 className="text-3xl font-bold text-slate-800">Data Wasit</h2>
                    {selectedLicense && (
                        <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            <span className="font-semibold">{selectedLicense}</span>
                            <button
                                onClick={() => setSelectedLicense(null)}
                                className="text-blue-600 hover:text-blue-800"
                                aria-label="Hapus filter"
                                title="Hapus filter"
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
                {logoUrl && (
                    <div className="watermark">
                        <img src={logoUrl} alt="Watermark Logo" />
                    </div>
                )}
                <div className="relative z-10">
                    {filteredReferees.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3">
                            {filteredReferees.map(referee => (
                                <RefereeCard key={referee.id} referee={referee} onCardClick={handleViewDetails} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-slate-500">
                                {selectedLicense
                                    ? `Tidak ada data wasit yang ditemukan dengan lisensi "${selectedLicense}".`
                                    : "Belum ada data wasit yang tersedia."
                                }
                            </p>
                            {selectedLicense && (
                                <button
                                    onClick={() => setSelectedLicense(null)}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Tampilkan Semua Wasit
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>
            <RefereeDetailModal 
                isOpen={!!selectedReferee}
                onClose={handleCloseDetails}
                referee={selectedReferee}
                logoUrl={logoUrl}
            />
        </div>
    );
};

export default HomePage;
