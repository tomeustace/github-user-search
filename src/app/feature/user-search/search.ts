import { User } from "./user";

export interface SearchResult {
  incomplete_results: boolean;
  items: User[];
  total_count: number;
}
