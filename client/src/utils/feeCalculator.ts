// utils/feeCalculator.ts

export interface Dog {
  DogID: number;
  DogName: string;
  IsSpayedNeutered: boolean;
  IsNuisance: boolean;
  IsDangerous: boolean;
  DateOfBirth: string;
}

export interface FeeCalculation {
  fee: number;
  licenseType: "Lifetime" | "Annual" | "Replacement";
  dogType: string;
  description: string;
}

/**
 * Calculate the age of a dog in months
 */
const calculateAgeInMonths = (dateOfBirth: string): number => {
  if (!dateOfBirth) return 0;

  const today = new Date();
  const birth = new Date(dateOfBirth);

  const years = today.getFullYear() - birth.getFullYear();
  const months = today.getMonth() - birth.getMonth();

  return years * 12 + months;
};

/**
 * Calculate license fee based on dog characteristics
 *
 * Fee Structure:
 * - Spayed/Neutered (6+ months): $62 - Lifetime
 * - Unaltered (6+ months): $90 - Lifetime
 * - Nuisance Dog: $125 - Annual
 * - Dangerous Dog: $250 - Annual
 * - Under 6 months: Free (handled separately, not a permanent license)
 * - Replacement License: $10 (any dog type)
 */
export const calculateLicenseFee = (
  dog: Dog,
  isReplacement: boolean = false
): FeeCalculation => {
  // Replacement licenses are always $10 regardless of dog type
  if (isReplacement) {
    return {
      fee: 10,
      licenseType: "Replacement",
      dogType: "ReplacementLicense",
      description: "Replacement dog license - any dog type",
    };
  }

  // Dangerous dogs: $250 annual (highest priority)
  if (dog.IsDangerous && dog.IsNuisance) {
    return {
      fee: 250,
      licenseType: "Annual",
      dogType: "DangerousDog",
      description: "Dangerous dog - requires annual license renewal",
    };
  }

  // Nuisance (non-dangerous) dogs: $125 annual
  if (dog.IsNuisance) {
    return {
      fee: 125,
      licenseType: "Annual",
      dogType: "NuisanceDog",
      description: "Nuisance dog - requires annual license renewal",
    };
  }

  // Check if dog is 6 months or older
  const ageInMonths = calculateAgeInMonths(dog.DateOfBirth);

  // Dogs under 6 months - note: typically these shouldn't get licenses yet
  if (ageInMonths < 6) {
    return {
      fee: 0,
      licenseType: "Lifetime",
      dogType: "Under6Months",
      description:
        "Dog under 6 months old - license should be issued at 6 months of age",
    };
  }

  // Spayed/Neutered dogs (6+ months): $62 lifetime
  if (dog.IsSpayedNeutered) {
    return {
      fee: 62.5,
      licenseType: "Lifetime",
      dogType: "SpayedNeutered6Plus",
      description: "Spayed/neutered dog (6+ months) - lifetime license",
    };
  }

  // Unaltered dogs (6+ months): $90 lifetime
  return {
    fee: 90,
    licenseType: "Lifetime",
    dogType: "Unaltered6Plus",
    description: "Unaltered dog (6+ months) - lifetime license",
  };
};

/**
 * Calculate expiry date based on license type
 */
export const calculateExpiryDate = (
  issueDate: string,
  licenseType: "Lifetime" | "Annual" | "Replacement"
): string => {
  const issue = new Date(issueDate);

  if (licenseType === "Annual") {
    // Add 1 year for annual licenses
    const expiry = new Date(issue);
    expiry.setFullYear(expiry.getFullYear() + 1);
    return expiry.toISOString().split("T")[0];
  } else {
    // Add 100 years for "lifetime" licenses (including replacement)
    const expiry = new Date(issue);
    expiry.setFullYear(expiry.getFullYear() + 100);
    return expiry.toISOString().split("T")[0];
  }
};

/**
 * Get human-readable age string
 */
export const getAgeString = (dateOfBirth: string): string => {
  if (!dateOfBirth) return "Unknown age";

  const ageInMonths = calculateAgeInMonths(dateOfBirth);

  if (ageInMonths < 6) {
    return `${ageInMonths} months old (under 6 months)`;
  } else if (ageInMonths < 12) {
    return `${ageInMonths} months old`;
  } else {
    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;
    if (months === 0) {
      return `${years} year${years > 1 ? "s" : ""} old`;
    }
    return `${years} year${years > 1 ? "s" : ""} and ${months} month${
      months > 1 ? "s" : ""
    } old`;
  }
};
