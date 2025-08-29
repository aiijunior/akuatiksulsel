export interface Referee {
  id: string;
  name: string;
  gender: 'L' | 'P'; // L: Laki-laki, P: Perempuan
  placeOfBirth: string;
  dateOfBirth: string; // YYYY-MM-DD
  address: string;
  phone: string;
  email: string;
  licenseNumber: string;
  highestLicense: string;
  sportBranch: string;
  experience: string[]; // Array of up to 5 strings
  photoUrl: string;
}
