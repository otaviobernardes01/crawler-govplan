import { handler } from '../src';

it("is free to test any desired client", async () => {
    await handler({ clientName: 'cliente de testes' });
});