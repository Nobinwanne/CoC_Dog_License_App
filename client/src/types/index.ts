export interface License {
  LicenseID: number;
  LicenseNumber: string;
  DogName: string;
  Breed: string;
   Roll: string | number | Date | undefined;
  Color?: string;
  DateOfBirth?: string;
  Gender?: string;
  IsSpayedNeutered?: boolean;
  IsNuisance?: boolean;
  TagNumber?: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone: string;
  Address?: string;
  City?: string;
  Province?: string;
  PostalCode?: string;
  IssueDate: string;
  LicenseType?: string;
  Status: string;
  Fee: number;
}

export interface LicenseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  license: License | null;
}

export interface DogDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dog: License | null;
}

export interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  license?: License | null;
  onPaymentSuccess?: () => void;
}

export interface DetailFieldProps {
  label: string;
  value?: string | number | Date;
}

export interface Owner {
  OwnerID: number;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone1: string;
  Phone2: string;
  Address: string;
  City: string;
  Province: string;
  PostalCode: string;
}

export interface Dog {
  DogID: number;
  DogName: string;
  Roll: number;
  Breed: string;
  Color: string;
  DateOfBirth: string;
  Gender: string;
  IsSpayedNeutered: boolean;
  IsNuisance: boolean;
  OwnerFirstName: string;
  OwnerLastName: string;
  OwnerEmail: string;
  OwnerPhone: string;
}