import { Ticket } from '../ticket';

it('implements optimistic concurrenty control', async (done) => {
  // Create an instance of a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '123',
  });

  // Save the ticket to the database
  await ticket.save();

  // Fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // Make two separate changes to the ticket we fetched
  firstInstance?.set({ price: 10 });
  secondInstance?.set({ price: 15 });

  // Save the first fetched ticket
  await firstInstance?.save();

  // Save the second fetch ticket and expect an error
  await secondInstance?.save();

  try {
    await secondInstance?.save();
  } catch (error) {
    return done();
  }
  throw new Error('Should not reach this point');

  // expect(async () => {
  //   await secondInstance?.save();
  // }).toThrow();
});
