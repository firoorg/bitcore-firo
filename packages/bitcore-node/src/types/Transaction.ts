export interface TransactionJSON {
  _id: string;
  txid: string;
  chain: string;
  network: string;
  blockHeight: number;
  blockHash: string;
  blockTime: string;
  blockTimeNormalized: string;
  coinbase: boolean;
  fee: number;
  size: number;
  locktime: number;
  inputCount: number;
  outputCount: number;
  value: number;
  extraPayload?: {
    proReg?: any,
    proUpServ?: any,
    proUpReg?: any,
    proUpRev?: any,
    cbTx?: any,
    finalCommitment?: any,
    sporkTx?: any
  }
}
