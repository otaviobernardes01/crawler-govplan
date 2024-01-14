export interface Plan {
    id?: string;
    year: string;
    status: string;
    identification: string;
    budget: number;
    client_id: string;
}

export interface PlanWithLink extends Plan {
    planDetailsLink: string;
  }