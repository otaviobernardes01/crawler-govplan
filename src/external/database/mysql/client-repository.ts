import { Client } from '../../../interfaces/client'
import { ClientRepository } from '../../../interfaces/client-repository'
import Connection from '../ports/connection'

export class ClientRepositoryDatabase implements ClientRepository {

    constructor(readonly connection: Connection) { }

    private async findByCnpj(cnpj: string): Promise<Client | null> {
        const result = await this.connection.query(`SELECT * FROM client WHERE cnpj = '${cnpj}'`)

        if (result.length === 0) return null
        return result[0]
    }

    async save(client: Client): Promise<string> {
        try {
            const resultFindClient = await this.findByCnpj(client.cnpj);
            if (resultFindClient) return resultFindClient.id

            const result = await this.connection.query(
                `INSERT INTO client (cnpj, companyName) VALUES  ('${client.cnpj}', '${client.companyName}')`
            )
            return result.insertId
        } catch (error) {
            console.error('Error saving client:', error);
            throw error;
        }
    }
}