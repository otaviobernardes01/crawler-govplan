import { Plan } from '../../../interfaces/plan'
import { PlanRepository } from '../../../interfaces/plan-repository'
import Connection from '../ports/connection'

export class PlanRepositoryDatabase implements PlanRepository {

    constructor(readonly connection: Connection) { }

    private async findPlan(identification: string, clientId: string): Promise<Plan | null> {
        const result = await this.connection.query(
            `SELECT * FROM plan WHERE identification = '${identification}' and client_id = ${clientId}`
        );
        if (result.length === 0) return null
        return result[0]
    }

    async save(clientId: string, plan: Plan): Promise<void> {
        try {
            const existPlan = await this.findPlan(plan.identification, clientId);

            if (!existPlan) {
                return this.connection.query(
                    `INSERT INTO plan (
                        year,
                        status,
                        identification,
                        budget,
                        client_id
                    ) VALUES  (
                        '${plan.year}', 
                        '${plan.status}',
                        '${plan.identification}',
                        '${plan.budget}',
                        '${clientId}'
                        )`
                );
            }
    
            return this.connection.query(
                `UPDATE plan SET
                    status = '${plan.status}',
                    identification = '${plan.identification}',
                    budget = '${plan.budget}',
                    year = '${plan.year}'
                WHERE id = ${existPlan.id}`
            );
        } catch (error) {
            console.error('Error saving plan:', error);
            throw error;
        }
    }
}