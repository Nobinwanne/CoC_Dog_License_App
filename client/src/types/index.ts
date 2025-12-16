export interface License {
  Notes: any;
  PaymentDate: string;
  TransactionId: any;
  PaymentMethod: string;
  PaymentStatus: string;
  IssueYear: string | number | Date | undefined;
  LicenseID: number;
  LicenseNumber: string;
  OwnerID: number;
  DogName: string;
  Breed: string;
  Roll: string | number;
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
  dogs?: Dog[];
  dogCount?: number
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
  OwnerID: number;
  OwnerFirstName: string;
  OwnerLastName: string;
  OwnerEmail: string;
  OwnerPhone: string;
}

export interface Tag {
  TagID: number;
  TagNumber: string;
  PurchaseYear: number;
  Status: string;
}

export interface EditOwnerFormProps {
  isOpen: boolean;
  onClose: () => void;
  owner: Owner | null;
  onSuccess?: () => void;
}

export interface EditDogFormProps {
  isOpen: boolean;
  onClose: () => void;
  dog: Dog | null;
  onSuccess?: () => void;
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


export interface OwnerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  owner: Owner | null;
  onEdit: () => void;
  onDelete: () => void;
  onIssueKennelLicense: () => void;
}


export interface DetailFieldProps {
  label: string;
  value?: string | number | Date;
}

export interface AddDogFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface AddOwnerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface AddLicenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
export interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  license: License | null;
}

