export interface Dog {
    DogName: string;
    Breed: string;
    Color: string;
    Gender: string;
}


export interface License {
  LicenseID: number;
  LicenseNumber: string;
  DogName: string;
  Breed: string;
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
  ExpirationDate: string;
  LicenseType?: string;
  Status: string;
  Fee: number;
}

export interface LicenseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  license: License | null;
}

export interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  license?: License | null;
  onPaymentSuccess?: () => void;
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