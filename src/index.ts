import axios from 'axios';
import { Client } from './interfaces/client';
import * as cheerio from 'cheerio';
import { Plan, PlanWithLink } from './interfaces/plan';
import { MysqlAdapter } from './external/database/adapters/mysql-adapter'
import { ClientRepositoryDatabase } from './external/database/mysql/client-repository';
import { PlanRepositoryDatabase } from './external/database/mysql/plan-repository';

const requester = axios.create();
const mysqlAdapter = new MysqlAdapter();
const clientRepository = new ClientRepositoryDatabase(mysqlAdapter);
const planRepository = new PlanRepositoryDatabase(mysqlAdapter);

export const handler = async (event: { clientName: string }) => {
    try {
        const clients = await extractClient(event.clientName)
        if (clients.length === 0) {
            console.info(`No clients were found with the name: ${event.clientName}`);
            return;            
        }

        const clientsPromises = clients.map(async (client: Client) => {
            const plans = await extractPlans(client.cnpj);

            const clientId = await clientRepository.save(client)
            plans.forEach(async (plan: Plan) => await planRepository.save(clientId, plan));

            console.info(`Success to extract PCAs from clientId ${clientId}`)
        });

        await Promise.all(clientsPromises);
    } catch (error) {
        console.error('Fail to extract PCAs:', error);
        throw new Error('fail to extract PCAs');
    }
}

const extractClient = async (clientName: string): Promise<Client[]> => {
    const response = await requester.post(
        `${process.env.BPSAUDE_ENDPOINT}/Transparencia/Home/PesquisaOrgao`,
        `termoPesquisado=${clientName}`
    )

    const html = cheerio.load(response.data.Html);
    const clients: Client[] = html('table.table tbody tr').map((_, row) => {
        const cnpj = html(row).find('td:eq(0)').text().trim().replace(/\D/g, '');
        const companyName = html(row).find('td:eq(1)').text().trim();

        return { cnpj, companyName };
    }).get();

    return clients;
};

const extractPlans = async (cnpj: string): Promise<PlanWithLink[]> => {
    const response = await requester.get(`${process.env.BPSAUDE_ENDPOINT}/Transparencia/orgao/${cnpj}`)
    const data = cheerio.load(response.data);

    const plans: PlanWithLink[] = data('table.table tbody tr').map((_, element) => {
        const year = data(element).find('td:eq(0)').text().trim();
        const status = data(element).find('td:eq(1)').text().trim();
        const identification = data(element).find('td:eq(2)').text().trim();
        const budget = data(element).find('td:eq(3)').text().trim();
        const planDetailsLink = data('table.table tbody tr:first-child td:eq(5) a').attr('href');

        return {
            year,
            status,
            identification,
            budget: parseCurrency(budget),
            planDetailsLink,
        };
    }).get();

    return plans
}
const parseCurrency = (currencyString: string): number => {
    const sanitizedString = currencyString.replace(/[^\d,]/g, '');
    const sanitizedNumber = parseFloat(sanitizedString.replace(',', '.'));
    return isNaN(sanitizedNumber) ? 0 : sanitizedNumber;
};