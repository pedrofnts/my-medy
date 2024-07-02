export interface Company {
  id: number;
  name: string;
  avatar_url?: string;
}

export interface SalesOwner {
  id: string;
  name: string;
  avatar_url?: string;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  company_id: number;
  job_title: string;
  status: string;
  created_at: string;
  sales_owner_id: string;
  phone: string;
  company?: Company;
  salesOwner?: SalesOwner;
  avatar_url?: string;
}
