import { Client } from "./client"

export interface ClientRepository {
    save(client: Client): Promise<string>
}