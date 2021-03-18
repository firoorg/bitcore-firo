import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiProvider, ChainNetwork } from '../../providers/api/api';

export interface LelantusStatusResult {
  totalMint: number;
  mintTxCount: number;
  totalSplit: number;
  splitTxCount: number;
  sigmaMint: { [key: number]: number },
  sigmaSpend: { [key: number]: number },
  lelantusMint: { [key: string]: { value: number, count: number } },
  lelantusSplit: { [key: string]: { value: number, count: number } }
}

export interface FiroStatusResult {
  info: {
    version: number;
    protocolversion: number;
    walletversion: number;
    balance: number;
    blocks: number;
    timeoffset: number;
    connections: 9;
    proxy: string;
    difficulty: number;
    testnet: boolean;
    keypoololdest: number;
    keypoolsize: number;
    paytxfee: number;
    mininput: number;
    relayfee: number;
    errors: string;
    network: string;
  },
  spork: {
    blockchain: Array<{ feature: string, enableAtHeight: number, parameter: any }>,
    mempool: Array<{ feature: string, enableAtHeight: number, parameter: any }>
  };
  blockchainInfo: {
    blocks: number;
    bestblockhash: string;
    verificationprogress: number;
    [key: string]: any
  }
}

@Injectable()
export class FiroProvider {
  constructor(public httpClient: HttpClient, private apiProvider: ApiProvider) { }

  public getLelantusStatus(chainNetwork?: ChainNetwork): Observable<LelantusStatusResult> {
    return this.httpClient.get<LelantusStatusResult>(
      `${this.apiProvider.getUrl(chainNetwork)}/lelantusStatus`
    );
  }

  public getFiroStatus(chainNetwork?: ChainNetwork): Observable<FiroStatusResult> {
    return this.httpClient.get<FiroStatusResult>(
      `${this.apiProvider.getUrl(chainNetwork)}/firoStatus`
    );
  }
}
