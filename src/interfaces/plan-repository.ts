import { Plan } from "./plan"

export interface PlanRepository {
    save(clientId: string, plan: Plan): Promise<void>
}