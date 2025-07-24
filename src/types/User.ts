export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
    createdAt: string;
    updatedAt: string;
    address: string;
    shippingAddress: ShippingAddress;
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  complement?: string;
}