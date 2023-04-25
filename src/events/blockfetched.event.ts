export class BlockFetchedEvent {
  constructor(
    public readonly timestamp: number,

    public readonly transactions: Array<string>,
  ) {}
}