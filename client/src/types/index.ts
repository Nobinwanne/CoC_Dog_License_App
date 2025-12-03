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
  TagNumber?: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone: string;
  Address?: string;
  City?: string;
  State?: string;
  ZipCode?: string;
  IssueDate: string;
  ExpirationDate: string;
  LicenseType?: string;
  Status: string;
  Fee: number;
  RabiesVaccinationDate?: string;
  RabiesVaccinationExpiration?: string;
  VeterinarianName?: string;
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