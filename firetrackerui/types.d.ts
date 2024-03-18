type Account = {
  created_at: string;
  id: number;
  updated_at: string;
  user_id: string;
  user_location: string | null;
}

type CaseLocation = {
  id: string;
  created_at: string;
  name: string;
  description: string;
  location: string;
}